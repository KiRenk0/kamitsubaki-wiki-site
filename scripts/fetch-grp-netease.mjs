// Query NetEase Cloud Music for GRP track metadata + lyrics.
// Output: scripts/data/grp-netease.json
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('..', import.meta.url));
function absPath(p) { return join(workspaceRoot, p); }

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const HEADERS = { 'User-Agent': UA, Referer: 'https://music.163.com' };

// [title, artist, category]
const TRACKS = [
  ['桜心中', '御莉姫'],
  ['さよなら、楽園', '硝子宮'],
  ['雑几帖', '心世紀'],
  ['侵蝕の記録', '美古途'],
  ['大罪', '罪十罰'],
  ['sweet/sour', '氷夏至'],
  ['クロマティック', '心世紀'],
  ['化け物でいさせて', '夕凪機'],
  ['Masquerade Kill', '御莉姫'],
  ['月へゆく', '佳鏡院'],
  ['改変-罪-', '罪十罰'],
  ['改変 -罪-', '罪十罰'],
  ['改変-心-', '心世紀'],
  ['改変 -心-', '心世紀'],
  ['改変', '少女革命計画'],
  ['主人行路', '心世紀'],
  ['鈍色幻灯', '心世紀'],
  ['SURVIVAL', '罪十罰'],
  ['ミリオン・コンプレクシティ', '心世紀'],
  ['SHOCK', '罪十罰'],
  ['Yellow Yellow', '夕凪機'],
  ['回想の層', '美古途'],
  ['ホンキートンキーラブ', '氷夏至'],
  ['うそ鳴き', '心世紀'],
  ['unknown', '硝子宮'],
  ['キリガサガリキ', '佳鏡院'],
  ['ANGER', '御莉姫'],
  ['blindness', '罪十罰'],
  ['ココロト', '心世紀'],
  ['瞬き', '御莉姫'],
  ['シネマティック', '佳鏡院'],
  ['ガラスのパズル', '硝子宮'],
  ['Synapse', '罪十罰'],
  ['Ephemeral', '心世紀'],
  ['アワセカガミ', '美古途'],
  ['Talking Doll', '御莉姫'],
  ['プレイヤーわたし', '夕凪機'],
  ['宇宙逃避行', '佳鏡院'],
  ['ジャンク', '氷夏至'],
  ['アイ', '硝子宮'],
  ['現世回帰', '心世紀'],
  ['セルフィッシュ', '美古途'],
  ['シンユウ', '御莉姫'],
  ['アバウト', '夕凪機'],
  ['夢の揺籠', '佳鏡院'],
  ['アライブ', '氷夏至'],
  ['well', '硝子宮'],
  ['DIGGER', '罪十罰'],
  ['パーフェクション', '心世紀'],
  ['弔花', '罪十罰'],
  ['フェイクナイト・シンデレラ', '心世紀'],
  // Album-only tracks
  ['ロストオービット', '心世紀'],
  ['いずれ僕は溶けて', '心世紀'],
  ['コントラスト', '心世紀'],
  ['FantastiQ', '心世紀'],
  ['RAVEN', '罪十罰'],
  ['アウフヘーベン', '罪十罰'],
  ['Brrrrrreak It', '罪十罰'],
  ['Envy', '罪十罰'],
];

async function searchNetEase(title, artist) {
  const params = new URLSearchParams({ s: `${title} ${artist}`, type: '1', offset: '0', limit: '10' });
  const url = `https://music.163.com/api/search/get?${params}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`search HTTP ${res.status}`);
  const data = await res.json();
  const songs = data?.result?.songs ?? [];
  // Prefer exact title + artist match
  const norm = (s) => s.replace(/\s+/g, '').toLowerCase();
  const exact = songs.find(
    (s) => norm(s.name) === norm(title) && norm(s.artists[0].name) === norm(artist),
  );
  const fallback = songs.find((s) => norm(s.name) === norm(title));
  return exact ?? fallback ?? songs[0] ?? null;
}

async function fetchLyric(songId) {
  const res = await fetch(`https://music.163.com/api/song/lyric?id=${songId}&lv=1&kv=1&tv=-1`, { headers: HEADERS });
  if (!res.ok) return '';
  const data = await res.json();
  return data?.lrc?.lyric ?? '';
}

async function main() {
  const results = [];
  let failCount = 0;
  for (const [title, artist] of TRACKS) {
    try {
      const song = await searchNetEase(title, artist);
      if (!song) throw new Error('not found');
      const lyric = await fetchLyric(song.id);
      results.push({
        queryTitle: title,
        queryArtist: artist,
        neteaseId: song.id,
        name: song.name,
        artist: song.artists.map((a) => a.name).join(' / '),
        album: song.album?.name ?? '',
        albumId: song.album?.id ?? null,
        durationMs: song.duration ?? null,
        publishTime: song.album?.publishTime ?? null,
        coverUrl: song.album?.artist?.img1v1Url || song.album?.blurPicUrl || '',
        lyric,
      });
      console.log(`OK ${title} -> ${song.name} (${song.id}) lyric:${lyric.length}`);
    } catch (err) {
      failCount += 1;
      console.error(`FAIL ${title} (${artist}): ${err.message}`);
      results.push({ queryTitle: title, queryArtist: artist, error: err.message });
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  await mkdir(absPath('scripts/data'), { recursive: true });
  await writeFile(absPath('scripts/data/grp-netease.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nDone: ${results.length} queried, ${failCount} failed. Wrote scripts/data/grp-netease.json`);
}

main();
