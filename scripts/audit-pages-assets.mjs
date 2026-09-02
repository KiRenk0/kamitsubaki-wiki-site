import { readdir, stat } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const CLOUDFLARE_PAGES_MAX_ASSET_BYTES = 25 * 1024 * 1024;

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(path);
    if (!entry.isFile()) return [];
    return [{ path, size: (await stat(path)).size }];
  }));

  return files.flat();
}

export async function auditPagesAssets(outputDirectory, options = {}) {
  const root = resolve(outputDirectory);
  const maxBytes = options.maxBytes ?? CLOUDFLARE_PAGES_MAX_ASSET_BYTES;
  const files = await collectFiles(root);
  const bySizeDescending = files.sort((left, right) => right.size - left.size);
  const toAsset = ({ path, size }) => ({
    path: relative(root, path).replaceAll('\\', '/'),
    size,
  });

  return {
    root,
    maxBytes,
    filesScanned: files.length,
    largest: bySizeDescending[0] ? toAsset(bySizeDescending[0]) : null,
    oversized: bySizeDescending.filter(({ size }) => size > maxBytes).map(toAsset),
  };
}

function formatMiB(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
}

async function main() {
  const outputDirectory = process.argv[2] || 'dist';
  const result = await auditPagesAssets(outputDirectory);

  if (result.oversized.length > 0) {
    console.error(
      `[pages-assets] ${result.oversized.length} file(s) exceed the Cloudflare Pages ${formatMiB(result.maxBytes)} limit:`,
    );
    for (const asset of result.oversized) {
      console.error(`- ${asset.path}: ${formatMiB(asset.size)} (${asset.size} bytes)`);
    }
    process.exitCode = 1;
    return;
  }

  const largest = result.largest
    ? `${result.largest.path}: ${formatMiB(result.largest.size)} (${result.largest.size} bytes)`
    : 'none';
  console.log(`[pages-assets] Checked ${result.filesScanned} files; largest asset ${largest}.`);
}

const isMain = process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMain) {
  main().catch((error) => {
    console.error(`[pages-assets] ${error.message}`);
    process.exitCode = 1;
  });
}
