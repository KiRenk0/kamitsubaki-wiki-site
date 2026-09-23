import {loadTraditionalConverters} from './aiResponseLocale.mjs';
export async function localizeArticleText(text,locale){if(!['zh-tw','zh-hk'].includes(locale))return text||'';const converters=await loadTraditionalConverters();return converters[locale](text||'');}
// Convert visible prose only. Never rewrite href, code, ruby readings or media URLs.
export async function localizeArticleBody(root,locale){
 if(!['zh-tw','zh-hk'].includes(locale))return;
 const converters=await loadTraditionalConverters(),walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
 while((node=walker.nextNode()))if(!node.parentElement?.closest('code,pre,script,style,rt,[lang="ja"]'))node.textContent=converters[locale](node.textContent);
}
