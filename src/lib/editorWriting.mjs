import {blockMarkdown} from './visualEditor.mjs';

export function upgradeListBlock(block) {
  return block.type==='list'?{...block,type:'paragraph',text:blockMarkdown(block)}:block;
}

// Only recognize a complete marker at the start of a line; never alter IME composition.
export function markdownTrigger(text) {
  if (/^[-+*]$/.test(text)) return {command:'insertUnorderedList'};
  if (/^1[.)]$/.test(text)) return {command:'insertOrderedList'};
  if (/^#{1,6}$/.test(text)) return {command:'formatBlock',value:`h${Math.max(2,text.length)}`};
  if (text === '>') return {command:'formatBlock',value:'blockquote'};
  return null;
}
