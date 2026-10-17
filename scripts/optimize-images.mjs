/* Uses Sharp already supplied by Next.js. No additional dependency required. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { sharp, ssim } from './image-quality.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apply = process.argv.includes('--apply');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = path.join(root, '.image-backups', stamp);
const files = [];
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git', '.image-backups', 'work'].includes(item.name)) continue;
    const file = path.join(dir, item.name);
    if (item.isDirectory()) walk(file);
    else if (/\.(png|jpe?g|webp|avif|gif|svg|ico)$/i.test(item.name)) files.push(file);
  }
}
async function main() {
  walk(root);
  const rows = [], hashes = new Map();
  const aliasesPath = path.join(root, 'src/lib/image-assets.ts');
  const aliasesText = fs.readFileSync(aliasesPath, 'utf8');
  const assets = JSON.parse(aliasesText.slice(aliasesText.indexOf(' = ') + 3).trim().replace(/;$/, ''));
  for (const file of files) {
    const relative = path.relative(root, file).replaceAll('\\', '/');
    const input = fs.readFileSync(file);
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    let metadata;
    try { metadata = await sharp(input).metadata(); } catch { metadata = {}; }
    const row = { file: relative, before: input.length, after: input.length, format: metadata.format ?? path.extname(file).slice(1), width: metadata.width, height: metadata.height, hash, duplicateOf: hashes.get(hash) ?? null, action: 'preserved', ssim: 1 };
    hashes.set(hash, relative);
    if (apply) {
      const saved = path.join(backup, relative);
      fs.mkdirSync(path.dirname(saved), { recursive: true }); fs.copyFileSync(file, saved);
    }
    // Sequence frames are protected: recompression trials increased size or
    // degraded texture. Their dimensions and pixels must stay unchanged.
    const isPortrait = relative.endsWith('joelson-portrait.png');
    const isPhoto = relative.includes('/about-polaroids/') && /\.jpe?g$/i.test(file);
    if (isPortrait || isPhoto) {
      const pipeline = () => isPhoto ? sharp(input).resize(576, 768, { fit: 'cover', position: 'centre' }) : sharp(input);
      const reference = await pipeline().flatten({ background: '#e3dfd1' }).raw().toBuffer({ resolveWithObject: true });
      const candidates = isPortrait
        ? [{ extension: '.webp', name: 'lossless WebP', encode: image => image.webp({ lossless: true, effort: 6 }) }]
        : [85, 90, 95].map(quality => ({ extension: '.avif', name: `AVIF ${quality}`, encode: image => image.avif({ quality, effort: 6, chromaSubsampling: '4:4:4' }) }));
      let best;
      for (const candidate of candidates) {
        const output = await candidate.encode(pipeline()).toBuffer();
        const decoded = await sharp(output).flatten({ background: '#e3dfd1' }).raw().toBuffer();
        const score = ssim(reference.data, decoded, reference.info.width, reference.info.height, reference.info.channels);
        if (score >= .995 && output.length < input.length && (!best || output.length < best.output.length)) best = { ...candidate, output, score };
      }
      if (best) {
        const destination = file.replace(/\.[^.]+$/, best.extension);
        Object.assign(row, { after: best.output.length, action: best.name, finalFile: path.relative(root, destination).replaceAll('\\', '/'), ssim: best.score, width: reference.info.width, height: reference.info.height });
        if (apply) {
          fs.writeFileSync(destination, best.output);
          const url = '/' + relative.replace(/^public\//, '');
          const finalUrl = '/' + row.finalFile.replace(/^public\//, '');
          for (const asset of Object.values(assets)) if (asset.src === url) Object.assign(asset, { src: finalUrl, width: row.width, height: row.height });
          assets[url] = { ...assets[url], src: finalUrl, width: row.width, height: row.height };
          const savedHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(backup, relative))).digest('hex');
          if (savedHash !== hash) throw new Error('Backup mismatch: ' + relative);
          fs.unlinkSync(file);
        }
      }
    }
    rows.push(row);
  }
  if (apply) {
    for (const asset of Object.values(assets)) {
      const file = path.join(root, 'public', asset.src);
      const blur = await sharp(file).resize({ width: 24, withoutEnlargement: true }).webp({ quality: 45 }).toBuffer();
      asset.blurDataURL = 'data:image/webp;base64,' + blur.toString('base64');
    }
    fs.writeFileSync(aliasesPath, 'export interface ImageAsset { src: string; width: number; height: number; blurDataURL: string; }\nexport const imageAssets: Record<string, ImageAsset> = ' + JSON.stringify(assets, null, 2) + ';\n');
  }
  const report = { mode: apply ? 'apply' : 'audit', backup: apply ? backup : null, before: rows.reduce((s, r) => s + r.before, 0), after: rows.reduce((s, r) => s + r.after, 0), qualityMethod: 'RGB block SSIM 8x8; conservative minimum .995; compare raw resized pixels, never a recompressed JPEG reference', rows };
  fs.writeFileSync(path.join(root, 'docs/image-optimization-current.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ mode: report.mode, images: rows.length, before: report.before, after: report.after, duplicates: rows.filter(r => r.duplicateOf).length }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
