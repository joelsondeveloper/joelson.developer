"use client";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { smokeFragment, smokeVertex } from "./smoke-shader";
import { SmokeFluid } from "./smoke-fluid";

/** Pigment transported by an incompressible flow; no React updates per frame. */
export function InteractiveSmoke({ sceneRef }: { sceneRef: RefObject<HTMLElement | null> }) {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = sceneRef.current;
    if (!canvas || !scene) return;
    if (reduced) { canvas.dataset.renderer = "fallback"; return; }
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
    if (!gl) { canvas.dataset.renderer = "fallback"; return; }
    const shaders: WebGLShader[] = [];
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vertex = compile(gl.VERTEX_SHADER, smokeVertex);
    const fragment = compile(gl.FRAGMENT_SHADER, smokeFragment);
    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    if (!vertex || !fragment || !program || !buffer) {
      shaders.forEach(shader => gl.deleteShader(shader));
      gl.deleteProgram(program); gl.deleteBuffer(buffer);
      canvas.dataset.renderer = "fallback";
      return;
    }
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      shaders.forEach(shader => gl.deleteShader(shader));
      gl.deleteProgram(program); gl.deleteBuffer(buffer);
      canvas.dataset.renderer = "fallback";
      return;
    }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "u_resolution");
    const time = gl.getUniformLocation(program, "u_time");
    const flowUniform = gl.getUniformLocation(program, "u_flow");
    const texture = gl.createTexture();
    if (!texture) { gl.useProgram(null); gl.deleteProgram(program); gl.deleteBuffer(buffer); shaders.forEach(shader => gl.deleteShader(shader)); canvas.dataset.renderer = "fallback"; return; }
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(flowUniform, 0);
    let fluid = new SmokeFluid(1), textureWidth = 0, textureHeight = 0;
    let previous: { x: number; y: number; time: number; id: number } | null = null;
    let raf = 0, lastTime = 0, elapsed = 0, frames = 0, interactions = 0;
    let lost = false, visible = true;
    const isActive = () => scene.dataset.active === "true" && Number(scene.dataset.aboutTime || 0) < 4.46;
    const draw = () => {
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(time, elapsed);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      if (textureWidth !== fluid.width || textureHeight !== fluid.height) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fluid.width, fluid.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, fluid.pixels);
        textureWidth = fluid.width; textureHeight = fluid.height;
      } else gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, fluid.width, fluid.height, gl.RGBA, gl.UNSIGNED_BYTE, fluid.pixels);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      canvas.dataset.frames = String(++frames);
    };
    const resize = () => {
      const rect = scene.getBoundingClientRect();
      // Bound shader work independently of high-density phone displays.
      const ratio = Math.min(window.devicePixelRatio || 1, 1.25, 1400 / Math.max(rect.width, 1));
      fluid = new SmokeFluid(rect.width / Math.max(rect.height, 1));
      previous = null;
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (!lost) draw();
    };
    const render = (now: number) => {
      raf = 0;
      if (!visible || lost || document.hidden || !isActive()) return;
      const delta = Math.min((now - lastTime) / 1000, .05);
      if (now - lastTime >= 1000 / 30) {
        lastTime = now; elapsed += delta;
        fluid.step(delta);
        draw();
      }
      raf = requestAnimationFrame(render);
    };
    const sync = () => {
      if (raf && visible && !lost && !document.hidden && isActive()) return;
      cancelAnimationFrame(raf); raf = 0;
      previous = null;
      if (visible && !lost && !document.hidden && isActive()) {
        lastTime = performance.now(); raf = requestAnimationFrame(render);
      }
    };
    const resetPointer = () => { previous = null; };
    const pointer = (event: PointerEvent) => {
      if (scene.dataset.active !== "true") return;
      const rect = scene.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width, y = 1 - (event.clientY - rect.top) / rect.height;
      if (previous && previous.id === event.pointerId && event.type !== "pointerdown") {
        const seconds = Math.max(1 / 120, Math.min(.08, (event.timeStamp - previous.time) / 1000));
        fluid.push(previous.x, previous.y, x, y, seconds);
        canvas.dataset.interactions = String(++interactions);
      }
      previous = { x, y, time: event.timeStamp, id: event.pointerId };
    };
    const contextLost = (event: Event) => {
      event.preventDefault(); lost = true; sync(); canvas.dataset.renderer = "fallback";
    };
    const resizeObserver = new ResizeObserver(resize);
    const activeObserver = new MutationObserver(sync);
    const viewportObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
    viewportObserver.observe(scene);
    resizeObserver.observe(scene);
    activeObserver.observe(scene, { attributes: true, attributeFilter: ["data-active", "data-about-time"] });
    scene.addEventListener("pointermove", pointer, { passive: true });
    scene.addEventListener("pointerdown", pointer, { passive: true });
    for (const type of ["pointerleave", "pointerup", "pointercancel"]) scene.addEventListener(type, resetPointer);
    document.addEventListener("visibilitychange", sync);
    canvas.addEventListener("webglcontextlost", contextLost);
    canvas.dataset.renderer = "webgl";
    resize(); sync();
    return () => {
      cancelAnimationFrame(raf); resizeObserver.disconnect(); activeObserver.disconnect(); viewportObserver.disconnect();
      scene.removeEventListener("pointermove", pointer); scene.removeEventListener("pointerdown", pointer);
      for (const type of ["pointerleave", "pointerup", "pointercancel"]) scene.removeEventListener(type, resetPointer);
      document.removeEventListener("visibilitychange", sync);
      canvas.removeEventListener("webglcontextlost", contextLost);
      shaders.forEach(shader => gl.deleteShader(shader));
      gl.useProgram(null); gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindTexture(gl.TEXTURE_2D, null); gl.deleteTexture(texture);
      gl.deleteBuffer(buffer); gl.deleteProgram(program);
    };
  }, [sceneRef, reduced]);

  return <canvas ref={canvasRef} className="portrait-smoke" aria-hidden="true" />;
}

