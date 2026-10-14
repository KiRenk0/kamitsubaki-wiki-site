import type { Plugin } from 'vite';
import { readdir, readFile, mkdir, writeFile, realpath } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { parseDocument } from 'yaml';
import { fileURLToPath } from 'node:url';
import { entityRoute } from '../../../src/lib/entityModel.mjs';
import { renderMarkdownDocument } from '../../../src/lib/markdown.mjs';
import { createEntityRegistry } from '../../../src/lib/entityRegistry.mjs';
import { entityCollections } from '../../../src/lib/entityModel.mjs';
import { renderWikiLinks } from '../../../src/lib/wikiLinks.mjs';
import { entityInfoModel } from '../../../src/lib/entityInfoModel.mjs';
import { entityDraftRegistry } from '../../../src/lib/entityDraftRegistry.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const contentRoot = resolve(root, 'src/content');
export type CatalogEntry = { path: string; title: string; romanized: string; aliases?: string[]; summary?: string; locale: string; entityType: string; collection: string; id: string; url: string | undefined; image: string | undefined };
async function walk(folder: string): Promise<string[]> {
  const entries = await readdir(folder, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory() ? walk(resolve(folder, entry.name)) :
    /\/(?:zh|ja|en)\.md$/.test('/' + entry.name) ? [resolve(folder, entry.name)] : []));
  return nested.flat();
}
export async function readCatalog(): Promise<CatalogEntry[]> {
  const paths = await walk(contentRoot);
  const entries = await Promise.all(paths.map(async (path): Promise<CatalogEntry | null> => {
    const source = await readFile(path, 'utf8');
    const match = source.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return null;
    try {
      const document = parseDocument(match[1]);
      if (document.errors.length) return null;
      const meta = document.toJS({ maxAliasCount: 100 });
      let url: string | undefined; try { url = `/${meta.locale}${entityRoute(meta)}`; } catch { /* Legacy records remain available as sources. */ }
      return { url, aliases: Array.isArray(meta.aliases) ? meta.aliases.filter((value: unknown) => typeof value === 'string') : [], summary: typeof meta.summary === 'string' ? meta.summary : '', image: typeof meta.presentation?.image === 'string' ? meta.presentation.image : undefined, path: relative(root, path), title: meta.name || meta.title || meta.id || '', romanized: meta.romanizedName || meta.romanizedTitle || '',
        locale: meta.locale, entityType: meta.entityType || '', collection: relative(contentRoot, path).split('/')[0], id: meta.id || meta.translationKey || '' };
    } catch { return null; }
  }));
  return entries.filter((entry): entry is CatalogEntry => Boolean(entry?.title));
}
async function readRegistry() {
  const collections = new Set<string>(entityCollections);
  const paths = (await walk(contentRoot)).filter(path => collections.has(relative(contentRoot, path).split('/')[0]));
  const entries = await Promise.all(paths.map(async filePath => {
    const source = await readFile(filePath, 'utf8');
    const match = source.match(/^(?:\uFEFF)?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) throw new Error('词条缺少属性：' + relative(root, filePath));
    return { filePath, data: parseDocument(match[1]).toJS({ maxAliasCount: 100 }), body: source.slice(match[0].length) };
  }));
  return createEntityRegistry(entries, JSON.parse(await readFile(resolve(root, 'src/data/entity-redirects.json'), 'utf8')));
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
  let registry: ReturnType<typeof readRegistry> | null = null;
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
          const frontmatter = source.match(/^(?:\uFEFF)?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
          const metadata = frontmatter ? parseDocument(frontmatter[1]).toJS({ maxAliasCount: 100 }) : {};
          const body = frontmatter ? source.slice(frontmatter[0].length) : source;
          registry ??= readRegistry();
          const [rendered, entities] = await Promise.all([renderMarkdownDocument(body), registry]);
          const currentRegistry = entityDraftRegistry(entities, metadata, body);
          const linked = renderWikiLinks(rendered.html, currentRegistry, metadata.locale || 'zh');
          return json({ ...linked, metadata, info: entityInfoModel(metadata, currentRegistry, metadata.locale || 'zh') });
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
