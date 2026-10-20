/** Small incompressible flow grid. Pointer motion injects momentum, never position locks. */
export class SmokeFluid {
  readonly width: number;
  readonly height: number;
  readonly pixels: Uint8Array;
  private readonly u: Float32Array;
  private readonly v: Float32Array;
  private readonly nextU: Float32Array;
  private readonly nextV: Float32Array;
  private readonly dx: Float32Array;
  private readonly dy: Float32Array;
  private readonly nextDx: Float32Array;
  private readonly nextDy: Float32Array;
  private readonly pressure: Float32Array;
  private readonly divergence: Float32Array;

  constructor(aspect: number) {
    this.width = Math.max(32, Math.round(112 * Math.min(aspect, 1)));
    this.height = Math.max(32, Math.round(112 / Math.max(aspect, 1)));
    const size = this.width * this.height;
    this.u = new Float32Array(size); this.v = new Float32Array(size);
    this.nextU = new Float32Array(size); this.nextV = new Float32Array(size);
    this.dx = new Float32Array(size); this.dy = new Float32Array(size);
    this.nextDx = new Float32Array(size); this.nextDy = new Float32Array(size);
    this.pressure = new Float32Array(size); this.divergence = new Float32Array(size);
    this.pixels = new Uint8Array(size * 4);
    this.encode();
  }

  push(x0: number, y0: number, x1: number, y1: number, seconds: number) {
    const w = this.width, h = this.height;
    const distance = Math.hypot((x1 - x0) * w, (y1 - y0) * h);
    if (distance < .05 || distance > Math.max(w, h) * .6) return;
    const steps = Math.min(24, Math.max(1, Math.ceil(distance / 2)));
    const vx = Math.max(-180, Math.min(180, (x1 - x0) * w / seconds)) * seconds * 6.0;
    const vy = Math.max(-180, Math.min(180, (y1 - y0) * h / seconds)) * seconds * 6.0;
    const radius = 4.8;
    for (let step = 0; step < steps; step++) {
      const t = (step + .5) / steps;
      const cx = (x0 + (x1 - x0) * t) * (w - 1);
      const cy = (y0 + (y1 - y0) * t) * (h - 1);
      for (let y = Math.max(1, Math.floor(cy - radius * 2)); y < Math.min(h - 1, cy + radius * 2); y++) {
        for (let x = Math.max(1, Math.floor(cx - radius * 2)); x < Math.min(w - 1, cx + radius * 2); x++) {
          const weight = Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (radius * radius)) / steps;
          const i = y * w + x;
          this.u[i] = Math.max(-35, Math.min(35, this.u[i] + vx * weight));
          this.v[i] = Math.max(-35, Math.min(35, this.v[i] + vy * weight));
        }
      }
    }
  }

  private sample(field: Float32Array, x: number, y: number) {
    const w = this.width;
    x = Math.max(.5, Math.min(w - 1.5, x));
    y = Math.max(.5, Math.min(this.height - 1.5, y));
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, i = iy * w + ix;
    return (field[i] * (1 - fx) + field[i + 1] * fx) * (1 - fy)
      + (field[i + w] * (1 - fx) + field[i + w + 1] * fx) * fy;
  }

  step(dt: number) {
    const w = this.width, h = this.height;
    const drag = Math.exp(-dt * 3.8), relax = Math.exp(-dt * .20);
    // Implicit viscosity spreads shear across neighboring cells instead of sharp eddies.
    // Four bounded implicit passes keep this stable for the capped 50 ms timestep.
    const viscosity = dt * 24, divisor = 1 + 4 * viscosity;
    this.nextU.set(this.u); this.nextV.set(this.v);
    for (let pass = 0; pass < 4; pass++) {
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        this.nextU[i] = (this.u[i] + viscosity * (this.nextU[i-1] + this.nextU[i+1] + this.nextU[i-w] + this.nextU[i+w])) / divisor;
        this.nextV[i] = (this.v[i] + viscosity * (this.nextV[i-1] + this.nextV[i+1] + this.nextV[i-w] + this.nextV[i+w])) / divisor;
      }
    }
    this.u.set(this.nextU); this.v.set(this.nextV);
    // Transport momentum with the flow, instead of attaching it to the current cursor.
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x, px = x - this.u[i] * dt, py = y - this.v[i] * dt;
      this.nextU[i] = this.sample(this.u, px, py) * drag;
      this.nextV[i] = this.sample(this.v, px, py) * drag;
    }
    this.u.set(this.nextU); this.v.set(this.nextV);
    // Pressure projection removes compression and lets a gesture spread into a wake.
    this.pressure.fill(0);
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      this.divergence[i] = -.5 * (this.u[i + 1] - this.u[i - 1] + this.v[i + w] - this.v[i - w]);
    }
    for (let iteration = 0; iteration < 18; iteration++) {
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        this.pressure[i] = (this.divergence[i] + this.pressure[i - 1] + this.pressure[i + 1] + this.pressure[i - w] + this.pressure[i + w]) * .25;
      }
    }
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      this.u[i] -= .5 * (this.pressure[i + 1] - this.pressure[i - 1]);
      this.v[i] -= .5 * (this.pressure[i + w] - this.pressure[i - w]);
    }
    // Advect the pigment displacement; it keeps evolving after pointer input stops.
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x, px = x - this.u[i] * dt, py = y - this.v[i] * dt;
      this.nextDx[i] = Math.max(-.16, Math.min(.16, (this.sample(this.dx, px, py) + this.u[i] * dt / w) * relax));
      this.nextDy[i] = Math.max(-.16, Math.min(.16, (this.sample(this.dy, px, py) + this.v[i] * dt / h) * relax));
    }
    this.dx.set(this.nextDx); this.dy.set(this.nextDy);
    this.encode();
  }

  private encode() {
    for (let i = 0; i < this.dx.length; i++) {
      this.pixels[i * 4] = Math.max(0, Math.min(255, 128 + Math.round(this.dx[i] / .32 * 255)));
      this.pixels[i * 4 + 1] = Math.max(0, Math.min(255, 128 + Math.round(this.dy[i] / .32 * 255)));
      this.pixels[i * 4 + 2] = 0;
      this.pixels[i * 4 + 3] = 255;
    }
  }
}


