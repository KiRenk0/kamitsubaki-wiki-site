import type { Plugin } from 'vite';
import { readdir, readFile, mkdir, writeFile, realpath } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { parseDocument } from 'yaml';
import { fileURLToPath } from 'node:url';
import { renderMarkdownDocument } from '../../../src/lib/markdown.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const contentRoot = resolve(root, 'src/content');
export type CatalogEntry = { path: string; title: string; romanized: string; locale: string; entityType: string; collection: string; id: string };
async function walk(folder: string): Promise<string[]> {
  const entries = await readdir(folder, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory() ? walk(resolve(folder, entry.name)) :
    /\/(?:zh|ja|en)\.md$/.test('/' + entry.name) ? [resolve(folder, entry.name)] : []));
  return nested.flat();
}
export async function readCatalog(): Promise<CatalogEntry[]> {
  const paths = await walk(contentRoot);
  const entries = await Promise.all(paths.map(async path => {
    const source = await readFile(path, 'utf8');
    const match = source.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return null;
    try {
      const document = parseDocument(match[1]);
      if (document.errors.length) return null;
      const meta = document.toJS({ maxAliasCount: 100 });
      return { path: relative(root, path), title: meta.name || meta.title || meta.id || '', romanized: meta.romanizedName || meta.romanizedTitle || '',
        locale: meta.locale, entityType: meta.entityType || '', collection: relative(contentRoot, path).split('/')[0], id: meta.id || meta.translationKey || '' };
    } catch { return null; }
  }));
  return entries.filter((entry): entry is CatalogEntry => Boolean(entry?.title));
}
async function sourcePath(value: string | null) {
  if (!value || !/^src\/content\/.+\/(?:zh|ja|en)\.md$/.test(value) || value.includes('\\') || value.split('/').some(part => part === '..' || part === '.')) throw new Error('无效的词条路径');
  const path = await realpath(resolve(root, value));
  if (!path.startsWith(contentRoot + '/')) throw new Error('词条不在内容目录内');
  return path;
}
async function requestBody(request: AsyncIterable<Uint8Array>, max = 1_000_000): Promise<Buffer> {
  const chunks: Buffer[] = []; let total = 0;
  for await (const chunk of request) { total += chunk.length; if (total > max) throw new Error('文件过大'); chunks.push(Buffer.from(chunk)); }
  return Buffer.concat(chunks);
}
export function localWikiApi(): Plugin {
  let catalog: Promise<CatalogEntry[]> | null = null;
  return { name: 'wiki-novel-local-api', configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      if (!request.url?.startsWith('/__novel/')) return next();
      const json = (value: any, status = 200) => { response.statusCode = status; response.setHeader('Content-Type', 'application/json; charset=utf-8'); response.setHeader('Cache-Control', 'no-store'); response.end(JSON.stringify(value)); };
      try {
        const url = new URL(request.url, 'http://127.0.0.1');
        if (request.method === 'GET' && url.pathname === '/__novel/catalog') {
          catalog ??= readCatalog(); return json({ entries: await catalog });
        }
        if (request.method === 'GET' && url.pathname === '/__novel/source') return json({ source: await readFile(await sourcePath(url.searchParams.get('path')), 'utf8') });
        if (request.method === 'POST' && url.pathname === '/__novel/preview') {
          const { source } = JSON.parse((await requestBody(request)).toString('utf8'));
          if (typeof source !== 'string') throw new Error('缺少 Markdown 内容');
          const body = source.replace(/^(?:\uFEFF)?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '');
          const rendered = await renderMarkdownDocument(body); return json({ html: rendered.html });
        }
        if (request.method === 'POST' && url.pathname === '/__novel/assets') {
          const mime = String(request.headers['content-type'] || '').split(';')[0];
          const extensions: Record<string, string> = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif' };
          if (!extensions[mime]) throw new Error('仅支持 PNG、JPEG、WebP、GIF 图片');
          const buffer = await requestBody(request, 10_000_000);
          const signature = buffer.toString('hex', 0, 12);
          const valid = mime === 'image/png' ? signature.startsWith('89504e470d0a1a0a') : mime === 'image/jpeg' ? signature.startsWith('ffd8ff') :
            mime === 'image/gif' ? buffer.toString('ascii', 0, 6).startsWith('GIF8') : buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
          if (!valid) throw new Error('图片格式与文件内容不一致');
          const name = createHash('sha256').update(buffer).digest('hex') + extensions[mime];
          const folder = resolve(root, 'public/images/novel-prototype'); await mkdir(folder, { recursive: true });
          try { await writeFile(resolve(folder, name), buffer, { flag: 'wx' }); } catch (error: any) { if (error.code !== 'EEXIST') throw error; }
          return json({ url: `/images/novel-prototype/${name}` });
        }
        return json({ error: '本地接口不存在' }, 404);
      } catch (error: any) { return json({ error: error.message || '本地请求失败' }, 400); }
    });
  } };
}
