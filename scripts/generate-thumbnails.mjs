import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

export const THUMBNAIL_WIDTHS = [96, 192, 480, 960];
const RECIPE = `webp-q78-effort4-auto-orient-v1-sharp${sharp.versions.sharp}`;
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const formats = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff', '.gif']);

async function filesIn(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(path));
    else if (entry.isFile() && formats.has(extname(entry.name).toLowerCase())) files.push(path);
  }
  return files.sort();
}

async function exists(path) { try { return (await stat(path)).isFile(); } catch { return false; } }
async function atomicWrite(path, data) {
  const temporary = `${path}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
  await writeFile(temporary, data);
  await rename(temporary, path);
}

/** Generates only local image derivatives. Source files are never modified. */
export async function generateThumbnails({ root = projectRoot, concurrency = 2, log = console.log } = {}) {
  const publicDir = resolve(root, 'public');
  const outputDir = resolve(publicDir, 'thumbnails');
  const manifestPath = resolve(root, '.cache/image-thumbnails/manifest.json');
  await mkdir(outputDir, { recursive: true });
  await mkdir(resolve(root, '.cache/image-thumbnails'), { recursive: true });
  const files = await filesIn(resolve(publicDir, 'images'));
  let previous = {};
  try { previous = JSON.parse(await readFile(manifestPath, 'utf8')); } catch { /* First build. */ }
  const manifest = { recipe: RECIPE, images: {} };
  const report = { sources: files.length, generated: 0, cached: 0, sourceBytes: 0, thumbnailBytes: 0, skipped: [] };
  let index = 0;
  const work = async () => {
    while (index < files.length) {
      const path = files[index++];
      const source = '/' + relative(publicDir, path).split('\\').join('/');
      const input = await readFile(path);
      const hash = createHash('sha256').update(RECIPE).update(input).digest('hex').slice(0, 20);
      const cached = previous.recipe === RECIPE && previous.images?.[source];
      if (cached?.hash === hash && (await Promise.all(cached.variants.map(v => exists(resolve(publicDir, v.src.slice(1)))))).every(Boolean)) {
        manifest.images[source] = cached;
        report.cached += 1; report.sourceBytes += cached.bytes;
        report.thumbnailBytes += cached.variants[0].bytes;
        continue;
      }
      let metadata;
      try { metadata = await sharp(input, { limitInputPixels: 80_000_000 }).metadata(); }
      catch { report.skipped.push({ source, reason: 'unsupported or invalid image' }); continue; }
      if ((metadata.pages || 1) > 1 || !metadata.width || !metadata.height) {
        report.skipped.push({ source, reason: 'animated or missing dimensions' }); continue;
      }
      const rotated = [5, 6, 7, 8].includes(metadata.orientation);
      const width = rotated ? metadata.height : metadata.width;
      const height = rotated ? metadata.width : metadata.height;
      const variants = [];
      for (const target of [...new Set(THUMBNAIL_WIDTHS.map(w => Math.min(w, width)))]) {
        const src = `/thumbnails/${hash}-${target}.webp`;
        const output = resolve(publicDir, src.slice(1));
        if (!await exists(output)) {
          const { data, info } = await sharp(input, { limitInputPixels: 80_000_000 })
            .rotate().resize({ width: target, withoutEnlargement: true })
            .webp({ quality: 78, effort: 4 }).toBuffer({ resolveWithObject: true });
          await atomicWrite(output, data);
          variants.push({ src, width: info.width, height: info.height, bytes: info.size });
          report.generated += 1;
        } else {
          variants.push({ src, width: target, height: Math.round(height * target / width), bytes: (await stat(output)).size });
        }
      }
      manifest.images[source] = { hash, width, height, bytes: input.length, variants };
      report.sourceBytes += input.length; report.thumbnailBytes += variants[0].bytes;
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(4, concurrency)) }, work));
  // Stable ordering keeps unchanged builds and development reloads quiet.
  manifest.images = Object.fromEntries(Object.entries(manifest.images).sort(([a], [b]) => a.localeCompare(b)));
  const serialized = JSON.stringify(manifest);
  if (serialized !== JSON.stringify(previous)) await atomicWrite(manifestPath, serialized);
  log(`[thumbnails] ${report.sources} sources; ${report.generated} generated; ${report.cached} unchanged; ${report.skipped.length} skipped`);
  if (report.skipped.length) log(`[thumbnails] Preserved originals: ${JSON.stringify(report.skipped)}`);
  return report;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  console.log(JSON.stringify(await generateThumbnails(), null, 2));
}
