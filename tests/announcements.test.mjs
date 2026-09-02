import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import yaml from 'yaml';

const locales = ['zh', 'ja', 'en'];

async function readAnnouncement(id, locale) {
  const source = await readFile(
    new URL(`../src/content/announcements/2026/${id}/${locale}.md`, import.meta.url),
    'utf8',
  );
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(frontmatter);
  return yaml.parse(frontmatter[1]);
}

test('V1.3.3 announcement is complete and superseded in every locale', async () => {
  const announcements = await Promise.all(
    locales.map((locale) => readAnnouncement('2026-07-26-v1-3-3', locale)),
  );

  assert.deepEqual(announcements.map((announcement) => announcement.locale), locales);
  assert.equal(
    announcements.every((announcement) => announcement.translationKey === '2026-07-26-v1-3-3'),
    true,
  );
  assert.equal(announcements.every((announcement) => announcement.pinned === false), true);
  assert.equal(announcements.every((announcement) => announcement.title.includes('V1.3.3')), true);
  assert.equal(announcements.every((announcement) => announcement.summary.length > 300), true);
  assert.equal(announcements.every((announcement) => !announcement.summary.includes('PR #')), true);
});

test('V2.0.0 announcement is pinned in every locale', async () => {
  const announcements = await Promise.all(
    locales.map((locale) => readAnnouncement('2026-09-01-v2-0-0', locale)),
  );

  assert.deepEqual(announcements.map((announcement) => announcement.locale), locales);
  assert.equal(announcements.every((announcement) => announcement.pinned === true), true);
  assert.equal(announcements.every((announcement) => announcement.title.includes('V2.0.0')), true);
});

test('previous V1.3.0 announcement is no longer pinned', async () => {
  const announcements = await Promise.all(
    locales.map((locale) => readAnnouncement('2026-07-22-v1-3-0', locale)),
  );

  assert.equal(announcements.every((announcement) => announcement.pinned === false), true);
});

test('announcement read state is scoped to the current announcement id', async () => {
  const component = await readFile(new URL('../src/components/AnnouncementModal.astro', import.meta.url), 'utf8');

  assert.match(component, /modal\.dataset\.announcementId/);
  assert.match(component, /getItem\(storageKey\) === announcementId/);
  assert.match(component, /setItem\(storageKey, announcementId\)/);
  assert.doesNotMatch(component, /setItem\(storageKey, 'true'\)/);
});
