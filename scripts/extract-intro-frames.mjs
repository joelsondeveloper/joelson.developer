import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Run from the project root. Requires an existing FFmpeg installation.
const source = resolve('public/videos/tv-zoom.mp4');
const base = resolve('public/images/tv-zoom');
const variants = [{ name: 'desktop', width: 1280, quality: 78 }, { name: 'mobile', width: 768, quality: 76 }];
const report = { source: 'tv-zoom.mp4', fps: 24, duration: 8, variants: [] };
for (const variant of variants) {
  const dir = resolve(base, variant.name);
  mkdirSync(dir, { recursive: true });
  const run = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', source, '-map', '0:v:0', '-vf', `scale=${variant.width}:-2`, '-fps_mode', 'passthrough', '-c:v', 'libwebp', '-quality', String(variant.quality), '-compression_level', '4', resolve(dir, 'frame-%04d.webp')], { stdio: 'inherit' });
  if (run.status !== 0) throw new Error(`FFmpeg failed for ${variant.name}`);
  const files = readdirSync(dir).filter(name => /^frame-\d{4}\.webp$/.test(name));
  if (files.length !== 192) throw new Error(`Expected 192 frames, got ${files.length}`);
  report.variants.push({ ...variant, frameCount: files.length, bytes: files.reduce((sum, name) => sum + statSync(resolve(dir, name)).size, 0) });
}
writeFileSync(resolve(base, 'manifest.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
