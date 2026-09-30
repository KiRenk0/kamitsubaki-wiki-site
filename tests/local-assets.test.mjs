import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('layout does not depend on Tailwind CDN at runtime', async () => {
  const layout = await readFile(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');

  assert.equal(layout.includes('cdn.tailwindcss.com'), false);
  assert.equal(layout.includes('tailwind.config'), false);
});

test('localized typography is bundled locally for every language', async () => {
  const layout = await readFile(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
  const stylesheet = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');

  for (const family of ['montserrat', 'noto-sans-sc', 'noto-serif-sc', 'noto-sans-tc', 'noto-serif-tc', 'noto-sans-jp', 'noto-serif-jp']) {
    assert.match(stylesheet, new RegExp(`@import "@fontsource-variable/${family}"`));
  }
  assert.doesNotMatch(layout, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
  assert.match(stylesheet, /:lang\(zh\)\s*\{\s*--font-sans:\s*"Montserrat Variable",\s*"Noto Sans SC Variable"/);
  assert.match(stylesheet, /:lang\(zh-Hant\)\s*\{\s*--font-sans:\s*"Montserrat Variable",\s*"Noto Sans TC Variable"/);
  assert.match(stylesheet, /html:lang\(zh-Hant-TW\),\s*\nhtml:lang\(zh-Hant-HK\)/);
  assert.match(stylesheet, /:lang\(ja\)\s*\{\s*--font-sans:\s*"Montserrat Variable",\s*"Noto Sans JP Variable"/);
  assert.match(stylesheet, /font-synthesis:\s*none/);
  assert.match(stylesheet, /b,\s*\nstrong\s*\{\s*\n\s*font-weight:\s*600/);
});

test('Tailwind scans application templates without traversing the content archive', async () => {
  const stylesheet = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');

  assert.match(stylesheet, /@import\s+["']tailwindcss["']\s+source\(none\)/);
  for (const source of ['components', 'layouts', 'lib', 'pages', 'scripts']) {
    assert.match(stylesheet, new RegExp(`@source\\s+["']\\.\\.\\/${source}["']`));
  }
  assert.doesNotMatch(stylesheet, /@source\s+["']\.\.\/content/);
});

test('VS Code parses Tailwind v4 styles with the Tailwind language mode', async () => {
  const [settingsText, extensionsText, gitignore] = await Promise.all([
    readFile(new URL('../.vscode/settings.json', import.meta.url), 'utf8'),
    readFile(new URL('../.vscode/extensions.json', import.meta.url), 'utf8'),
    readFile(new URL('../.gitignore', import.meta.url), 'utf8'),
  ]);
  const settings = JSON.parse(settingsText);
  const extensions = JSON.parse(extensionsText);

  assert.equal(settings['files.associations']['*.css'], 'tailwindcss');
  assert.ok(extensions.recommendations.includes('bradlc.vscode-tailwindcss'));
  assert.match(gitignore, /^\.vscode\/\*$/m);
  assert.match(gitignore, /^!\.vscode\/settings\.json$/m);
  assert.match(gitignore, /^!\.vscode\/extensions\.json$/m);
});
