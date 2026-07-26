import OpenCC from 'opencc-js';

const japaneseToTraditional = OpenCC.Converter({ from: 'jp', to: 't' });
const traditionalToSimplified = OpenCC.Converter({ from: 't', to: 'cn' });

function katakanaToHiragana(value) {
  return value.replace(/[\u30a1-\u30f6]/gu, (character) =>
    String.fromCharCode(character.charCodeAt(0) - 0x60)
  );
}

export function foldCjkSearchText(value) {
  const normalized = String(value || '')
    .normalize('NFKC')
    .toLocaleLowerCase();
  const canonicalCjk = traditionalToSimplified(japaneseToTraditional(normalized));

  return katakanaToHiragana(canonicalCjk)
    .replace(/\s+/gu, ' ')
    .trim();
}
