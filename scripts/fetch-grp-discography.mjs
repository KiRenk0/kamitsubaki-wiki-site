// Batch-fetch GIRLS REVOLUTION PROJECT discography detail pages and
// extract release metadata. Output: scripts/data/grp-discography.json
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('..', import.meta.url));

function absPath(p) { return join(workspaceRoot, p); }

// id -> [title, artist] from the discography index pages
const TRACKS = [
  [667, '桜心中', '御莉姫'],
  [660, 'さよなら、楽園', '硝子宮'],
  [653, '雑几帖', '心世紀'],
  [651, '侵蝕の記録', '美古途'],
  [646, '大罪', '罪十罰'],
  [637, 'sweet/sour', '氷夏至'],
  [623, 'クロマティック feat.ヰ世界情緒', '心世紀×罪十罰'],
  [616, '化け物でいさせて', '夕凪機'],
  [596, 'Masquerade Kill', '御莉姫'],
  [593, '月へゆく', '佳鏡院'],
  [584, '改変-罪-', '罪十罰'],
  [583, '改変-心-', '心世紀'],
  [579, '改変', '心世紀×罪十罰'],
  [557, '主人行路', '心世紀×罪十罰'],
  [505, '鈍色幻灯', '心世紀×罪十罰'],
  [491, 'SURVIVAL', '罪十罰'],
  [488, 'ミリオン・コンプレクシティ', '心世紀'],
  [478, 'SHOCK', '罪十罰'],
  [476, 'Yellow Yellow', '夕凪機'],
  [474, '回想の層', '美古途'],
  [472, 'ホンキートンキーラブ', '氷夏至'],
  [468, 'うそ鳴き', '心世紀'],
  [466, 'unknown', '硝子宮'],
  [464, 'キリガサガリキ', '佳鏡院'],
  [462, 'ANGER', '御莉姫'],
  [447, 'blindness', '罪十罰'],
  [444, 'ココロト', '心世紀'],
  [441, '瞬き', '御莉姫,夕凪機'],
  [439, 'シネマティック', '佳鏡院,氷夏至'],
  [437, 'ガラスのパズル', '硝子宮,美古途'],
  [435, 'Synapse', '罪十罰'],
  [423, 'Ephemeral', '心世紀'],
  [420, 'アワセカガミ', '美古途'],
  [415, 'Talking Doll', '御莉姫'],
  [413, 'プレイヤーわたし', '夕凪機'],
  [411, '宇宙逃避行', '佳鏡院'],
  [409, 'ジャンク', '氷夏至'],
  [407, 'アイ', '硝子宮'],
  [405, '現世回帰', '心世紀×罪十罰'],
  [397, 'セルフィッシュ', '美古途'],
  [395, 'シンユウ', '御莉姫'],
  [390, 'アバウト', '夕凪機'],
  [388, '夢の揺籠', '佳鏡院'],
  [384, 'アライブ', '氷夏至'],
  [379, 'well', '硝子宮'],
  [374, 'DIGGER', '罪十罰'],
  [358, 'パーフェクション', '心世紀'],
  [311, '弔花', '罪十罰'],
  [260, 'フェイクナイト・シンデレラ', '心世紀'],
];

function extractMeta(html) {
  const meta = {};
  const releaseMatch = html.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})\s*Release/);
  if (releaseMatch) {
    const [, y, m, d] = releaseMatch;
    meta.releaseDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const typeMatch = html.match(/Release\s*\r?\n-\s*([A-Za-z ]+)/);
  meta.type = typeMatch ? typeMatch[1].trim() : '';
  const linkMatch = html.match(/Download \/ Streaming \(https:\/\/zula\.link-map\.jp\/links\/([^)]+)\)/);
  meta.streamLink = linkMatch ? `https://zula.link-map.jp/links/${linkMatch[1]}` : '';

  // Album track lists: numbered lines "1.タイトル（Lyrics & Music：xxx）"
  const trackSection = html.match(/【収録曲】([\s\S]*?)(?:Download \/ Streaming|$)/);
  if (trackSection) {
    const tracks = [];
    const lineRe = /(\d+)\.\s*([^（\n]+)(?:（([^）]*)）)?/g;
    let m;
    while ((m = lineRe.exec(trackSection[1]))) {
      tracks.push({ no: Number(m[1]), title: m[2].trim(), credit: (m[3] ?? '').trim() });
    }
    if (tracks.length) meta.albumTracks = tracks;
  }

  const descMatch = html.match(/<h2>(?:<[^>]+>)*([^<]+)(?:<\/[^>]+>)*<\/h2>/);
  meta.titleFromPage = descMatch ? descMatch[1].trim() : '';

  const vocalMatch = html.match(/Vocal[：:]\s*([^<\n]+)/);
  meta.vocal = vocalMatch ? vocalMatch[1].trim() : '';
  const lyricMatch = html.match(/Lyrics[：:]\s*([^<\n]+)/);
  meta.lyricsCredit = lyricMatch ? lyricMatch[1].trim() : '';
  const musicMatch = html.match(/Music[：:]\s*([^<\n]+)/);
  meta.musicCredit = musicMatch ? musicMatch[1].trim() : '';

  return meta;
}

async function main() {
  const results = [];
  for (const [id, title, artist] of TRACKS) {
    const url = `https://girlsrevolutionproject.jp/discography/${id}/`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      results.push({ id, title, artist, url, ...extractMeta(html) });
      console.log(`OK ${id} ${title}`);
    } catch (err) {
      console.error(`FAIL ${id} ${title}: ${err.message}`);
      results.push({ id, title, artist, url, error: err.message });
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  await mkdir(dirname(absPath('scripts/data/grp-discography.json')), { recursive: true });
  await writeFile(absPath('scripts/data/grp-discography.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nWrote ${results.length} entries to scripts/data/grp-discography.json`);
}

main();
