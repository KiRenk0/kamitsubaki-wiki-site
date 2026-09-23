import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const contentRoot = 'src/content';

// Locale-agnostic path corrections: legacy/incorrect path -> canonical route.
const map = new Map(Object.entries({
  '/organizations/parent-companies/thinkr': '/database/studios/thinkr',
  '/organizations/record-network/pndr': '/database/studios/pndr',
  '/organizations/record-network/phenomenon-record': '/database/studios/phenomenon-record',
  '/organizations/record-network/anarchic-record': '/database/studios/anarchic-record',
  '/organizations/record-network/sinsekai-record': '/database/studios/sinsekai-record',
  '/organizations/creative-network/thinkr-creative-guild': '/database/studios/thinkr-creative-guild',
  '/organizations/creative-studios/phase-studio': '/database/studios/phase-studio',
  '/organizations/creative-studios/qa-studio': '/database/studios/qa-studio',
  '/projects/city-project/kamitsubaki-city': '/database/projects/kamitsubaki-city',
  '/projects/city-project/city-games/kamitsubaki-city-ensemble': '/database/projects/kamitsubaki-city-ensemble',
  '/projects/city-project/city-games/kamitsubaki-city-regenerate': '/database/projects/kamitsubaki-city-regenerate',
  '/projects/city-project/city-games/kamitsubaki-city-vr': '/database/projects/kamitsubaki-city-vr',
  '/artists/sinsekai/dustcell': '/database/artists/groups/dustcell',
  '/artists/sinsekai/valis': '/database/artists/groups/valis',
  '/artists/creators/onuma-parsley': '/database/creators/onuma-parsley',
  '/lives/flagship-lives/sinka-live': '/database/lives/sinka-live',
  '/songs/unassigned/ciel-mijikayo-no-hoshi': '/database/music/songs/ciel-mijikayo-no-hoshi',
  '/albums/dustcell/summit-1688155907': '/albums/dustcell/SUMMIT-1688155907',
  '/albums/dustcell/hypnotize-1637382530': '/albums/dustcell/Hypnotize-1637382530',
  '/albums/dustcell/round-trip-1676025466': '/albums/dustcell/ROUND-TRIP-1676025466',
  '/albums/empty-old-city/from-noir-into-clair-1840911030': '/albums/empty-old-city/From-Noir-into-Clair-1840911030',
  '/albums/empty-old-city/strings-in-owl-1888375903': '/albums/empty-old-city/Strings-in-Owl-1888375903',
  '/albums/yunosuke/black-or-white-1304869904': '/albums/yunosuke/Black-or-White-1304869904',
  '/albums/yunosuke/fiction-1419403824': '/albums/yunosuke/Fiction-1419403824',
  '/albums/yunosuke/pathos-1103188278': '/albums/yunosuke/Pathos-1103188278',
  '/albums/yunosuke/proto-1535422307': '/albums/yunosuke/Proto-1535422307',
  '/albums/yunosuke/tranquilizer-1684861827': '/albums/yunosuke/Tranquilizer-1684861827',
  '/albums/yunosuke/unique-antique-1011454503': '/albums/yunosuke/Unique-Antique-1011454503',
  '/songs/albemuth/originals/tuberose-feat-存流--明透': '/songs/albemuth/originals/tuberose-feat.-存流-&-明透',
  '/songs/albemuth/originals/underdrain-feat-存流--明透': '/songs/albemuth/originals/underdrain-feat.-存流-&-明透',
  '/songs/albemuth/originals/星月夜no調be-feat-存流--明透': '/songs/albemuth/originals/星月夜no調be-feat.-存流-&-明透',
  '/songs/dustcell/originals/nighthawk-feat-tanaka': '/songs/dustcell/originals/nighthawk-feat.-tanaka',
  '/songs/hiratayoshihisa/originals/日本no夏-feat-七滝今--梓川': '/songs/hiratayoshihisa/originals/日本no夏-feat.-七滝今-&-梓川',
  '/songs/kaika/originals/東京bokuraha大丈夫kana': '/songs/kaika/originals/東京,bokuraha大丈夫kana',
  '/songs/toa/originals/tsugihagisutakkaato-feat-初音miku': '/songs/toa/originals/tsugihagisutakkaato-feat.-初音miku',
  '/songs/toa/originals/真白闇-feat-初音miku': '/songs/toa/originals/真白闇-feat.-初音miku',
  '/songs/yunosuke/originals/mrdj-feat-初音miku': '/songs/yunosuke/originals/mr.dj-feat.-初音miku',
  '/songs/yunosuke/originals/paiiiprediction': '/songs/yunosuke/originals/paiii.prediction',
  '/songs/valis/originals/%E5%81%B6%E5%83%8Fnaitomea': '/songs/valis/originals/偶像naitomea',
  '/songs/valis/originals/%E5%86%8D%E8%A6%8Bromanesuku': '/songs/valis/originals/再見romanesuku',
  '/songs/valis/originals/%E7%84%A1%E7%AA%AEpuratonikku': '/songs/valis/originals/無窮puratonikku',
  '/songs/valis/originals/%E7%86%B1%E6%84%9Bfuroozun': '/songs/valis/originals/熱愛furoozun',
  '/songs/vwp/remixes/閃光だったrearranged-ver-insight-rearranged-ver': '/songs/vwp/remixes/閃光だった(Rearranged-Ver)-insight-rearranged-ver'
}));

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.md')) out.push(p);
  }
  return out;
}

const report = JSON.parse(readFileSync('docs/v3/reports/migration-report.json', 'utf8'));
const relocation = JSON.parse(readFileSync('docs/v3/reports/content-layout.json', 'utf8'));
const moved = new Map(relocation.moves.map((m) => [m.from, m.to]));
const currentPath = (p) => {
  const seen = new Set();
  while (moved.has(p) && !seen.has(p)) {
    seen.add(p);
    p = moved.get(p);
  }
  return p;
};
// Audited files must keep their original body byte-for-byte, so their legacy
// links cannot be rewritten in place.
const AUDITED = new Set(report.files.map((f) => currentPath(f.path)));

let changedFiles = 0;
let changedLinks = 0;
for (const file of walk(contentRoot)) {
  if (AUDITED.has(file)) continue;
  const original = readFileSync(file, 'utf8');
  let text = original;
  for (const [from, to] of map) {
    const patterns = [`(/${'zh-tw'}${from}`, `(/zh${from}`, `(/ja${from}`, `(/en${from}`, `(/${'zh-hk'}${from}`];
    for (const pat of patterns) {
      const target = pat.replace(from, to);
      while (text.includes(pat)) {
        text = text.split(pat).join(target);
        changedLinks++;
      }
    }
  }
  // encodeURI-safe: replace any remaining percent-encoded valis sing titles
  if (text !== original) {
    writeFileSync(file, text, 'utf8');
    changedFiles++;
  }
}
console.log(`updated ${changedFiles} files, ${changedLinks} link rewrites`);
