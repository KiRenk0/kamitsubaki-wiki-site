import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { detectExternalPlatform, externalPlatformIds } from '../src/lib/externalPlatforms.mjs';

test('external platform registry recognizes the supported brand domains', () => {
  const cases = [
    ['https://space.bilibili.com/123', 'bilibili'],
    ['https://b23.tv/example', 'bilibili'],
    ['https://youtu.be/example', 'youtube'],
    ['https://twitter.com/example', 'x'],
    ['https://x.com/example', 'x'],
    ['https://www.tiktok.com/@example', 'tiktok'],
    ['https://instagram.com/example', 'instagram'],
    ['https://weibo.com/u/1', 'weibo'],
    ['https://www.nicovideo.jp/watch/example', 'niconico'],
    ['https://open.spotify.com/artist/example', 'spotify'],
    ['https://music.apple.com/jp/artist/example', 'apple-music'],
    ['https://music.163.com/#/artist?id=1', 'netease-music'],
    ['https://www.pixiv.net/users/1', 'pixiv'],
    ['https://piapro.jp/example', 'piapro'],
    ['https://store.steampowered.com/app/1', 'steam'],
    ['https://en.wikipedia.org/wiki/Kaf', 'wikipedia'],
    ['https://kaf.kamitsubaki.jp/', 'kamitsubaki'],
  ];

  for (const [href, expected] of cases) {
    assert.equal(detectExternalPlatform({ href }).id, expected, href);
  }
});

test('labels support music landing pages and unknown links receive an accessible fallback', () => {
  assert.equal(detectExternalPlatform({ href: 'https://artist.lnk.to/release', label: 'Listen on Spotify' }).id, 'spotify');
  assert.equal(detectExternalPlatform({ href: 'https://artist.lnk.to/release', label: 'Apple Music' }).id, 'apple-music');
  assert.equal(detectExternalPlatform({ href: 'https://example.com', label: 'Official Website' }).id, 'website');
  assert.equal(detectExternalPlatform({ href: 'https://kamitsubaki.jp/artist/kaf', label: 'Spotify campaign' }).id, 'kamitsubaki');
});

test('every branded registry entry exposes production SVG geometry', () => {
  assert.ok(externalPlatformIds.includes('kamitsubaki'));
  assert.ok(externalPlatformIds.includes('website'));

  const labelsById = {
    bilibili: 'Bilibili',
    youtube: 'YouTube',
    x: 'X',
    tiktok: 'TikTok',
    instagram: 'Instagram',
    weibo: 'Weibo',
    niconico: 'Niconico',
    spotify: 'Spotify',
    'apple-music': 'Apple Music',
    'netease-music': 'NetEase',
    pixiv: 'pixiv',
    piapro: 'piapro',
    steam: 'Steam',
    wikipedia: 'Wikipedia',
  };

  for (const [id, label] of Object.entries(labelsById)) {
    const platform = detectExternalPlatform({ label });
    assert.equal(platform.id, id);
    assert.ok(platform.icon?.path.length > 40, `${id} should expose a real SVG path`);
  }
});
