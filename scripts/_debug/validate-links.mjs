import fs from 'node:fs';
import path from 'node:path';

const routes = new Set();
const walk = (dir, cb) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, cb);
    else cb(p);
  }
};
walk('dist', (p) => {
  const norm = p.split(path.sep).join('/');
  if (norm.endsWith('/index.html')) routes.add('/' + norm.replace(/^dist\//, '').replace(/\/index\.html$/, ''));
});
console.log('built routes:', routes.size);

const LOCALES = ['zh', 'zh-tw', 'zh-hk', 'ja', 'en'];
const dead = new Map();
const walkMd = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkMd(p);
    else if (e.name.endsWith('.md') && LOCALES.includes(e.name.replace(/\.md$/, ''))) {
      const s = fs.readFileSync(p, 'utf8');
      const re = /\]\((\/(?:zh-tw|zh-hk|zh|ja|en)\/(?:songs|albums|artists|projects)\/[^\s)#?]+)\)/gu;
      let m;
      while ((m = re.exec(s))) {
        const dest = m[1];
        if (!routes.has(dest)) {
          if (!dead.has(dest)) dead.set(dest, new Set());
          dead.get(dest).add(p.split(path.sep).join('/'));
        }
      }
    }
  }
};
for (const c of ['songs', 'albums', 'artists', 'projects']) walkMd(path.join('src/content', c));
console.log('dead internal links (vs fresh dist):', dead.size);
for (const [k, v] of [...dead.entries()].sort((a, b) => b[1].size - a[1].size).slice(0, 30)) {
  console.log(' ', k, '<-', v.size, 'file(s):', [...v][0]);
}
