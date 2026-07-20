import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import yaml from 'yaml';

const locales = ['zh', 'ja', 'en'];
const entriesUsingDefaultLicense = [
  'artists/isotopes/coko',
  'artists/isotopes/haru',
  'artists/isotopes/kafu',
  'artists/isotopes/rime',
  'artists/isotopes/sekai',
  'artists/vwp/harusaruhi',
  'artists/vwp/isekaijoucho',
  'artists/vwp/kaf',
  'artists/vwp/koko',
  'artists/vwp/rim',
  'projects/labels/kamitsubaki-studio',
];

async function readProjectFile(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

async function readFrontmatter(path) {
  const source = await readProjectFile(path);
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(match, `Expected YAML frontmatter in ${path}`);
  return yaml.parse(match[1]);
}

test('localized footers expose the layered default text license', async () => {
  for (const locale of locales) {
    const site = JSON.parse(await readProjectFile(`src/content/site/${locale}.json`));

    assert.equal(site.footer.license.detailsHref, `/${locale}/license`);
    assert.equal(site.footer.license.deedHref, 'https://creativecommons.org/licenses/by-nc-sa/4.0/');
    assert.match(site.footer.license.deedLabel, /CC BY-NC-SA 4\.0/);
    assert.doesNotMatch(site.footer.copyright, /All Rights Reserved/i);
  }
});

test('footer and entry notices expose machine-readable license links and media exclusions', async () => {
  const [footer, notice] = await Promise.all([
    readProjectFile('src/components/SiteFooter.astro'),
    readProjectFile('src/components/ContentLicenseNotice.astro'),
  ]);

  assert.match(footer, /rel="license"/);
  assert.match(notice, /data-license-code=\{resolvedLicense\.code\}/);
  assert.match(notice, /creativecommons\.org\/licenses\/by-nc-sa\/4\.0\//);
  assert.match(notice, /creativecommons\.org\/licenses\/by-nc-sa\/3\.0\/cn\//);
  assert.match(notice, /Images, cover art, lyrics, audio, video/);
});

test('content schema accepts only the four supported license markers', async () => {
  const config = await readProjectFile('src/content.config.ts');

  for (const code of [
    'CC-BY-NC-SA-4.0',
    'CC-BY-NC-SA-3.0-CN',
    'rights-reserved',
    'authorized-use',
  ]) {
    assert.match(config, new RegExp(`['"]${code.replaceAll('.', '\\.') }['"]`));
  }

  assert.match(config, /\['attribution', 'sourceTitle', 'sourceUrl', 'modifications'\]/);
  assert.match(config, /\$\{field\} is required for CC-BY-NC-SA-3\.0-CN material/);
});

test('selected entries use the site-wide default license without source-specific labels', async () => {
  for (const entry of entriesUsingDefaultLicense) {
    for (const locale of locales) {
      const frontmatter = await readFrontmatter(`src/content/${entry}/${locale}.md`);

      assert.equal(frontmatter.license, undefined);
    }
  }
});

test('localized copyright page documents reuse, attribution, exclusions, and mixed licenses', async () => {
  const page = await readProjectFile('src/pages/[locale]/license.astro');

  assert.match(page, /CC BY-NC-SA 4\.0/);
  assert.match(page, /CC BY-NC-SA 3\.0/);
  assert.match(page, /rel="license"/);
  assert.match(page, /Recommended attribution/);
  assert.match(page, /Excluded from the default 4\.0 license/);
  assert.match(page, /does not currently obtain a blanket CC license/);
});

test('all public entry templates render the reusable content license notice', async () => {
  for (const path of [
    'src/pages/[locale]/artists/[...id].astro',
    'src/pages/[locale]/projects/[...id].astro',
    'src/pages/[locale]/logs/[...id].astro',
    'src/pages/[locale]/songs/[...id].astro',
    'src/pages/[locale]/albums/[...id].astro',
  ]) {
    const page = await readProjectFile(path);
    assert.match(page, /ContentLicenseNotice/);
    assert.match(page, /license=\{entry\.data\.license\}/);
  }
});

test('repository licensing documentation stays aligned across all three languages', async () => {
  const documents = await Promise.all([
    readProjectFile('docs/licensing.md'),
    readProjectFile('docs/licensing.ja.md'),
    readProjectFile('docs/licensing.en.md'),
  ]);

  for (const document of documents) {
    assert.match(document, /CC-BY-NC-SA-4\.0/);
    assert.match(document, /CC-BY-NC-SA-3\.0-CN/);
    assert.match(document, /rights-reserved/);
    assert.match(document, /authorized-use/);
    assert.match(document, /sourceUrl/);
    assert.match(document, /modifications/);
  }

  for (const [locale, suffix] of [['zh', ''], ['ja', '.ja'], ['en', '.en']]) {
    const [readme, contributionGuide] = await Promise.all([
      readProjectFile(locale === 'zh' ? 'README.md' : `README.${locale}.md`),
      readProjectFile(`docs/contributing${suffix}.md`),
    ]);

    assert.match(readme, new RegExp(`docs/licensing${suffix.replace('.', '\\.') }\\.md`));
    assert.match(contributionGuide, new RegExp(`licensing${suffix.replace('.', '\\.') }\\.md`));
  }
});
