/** Convert imported MediaWiki notation for display without rewriting the source record. */
export function prepareResearchMarkdown(entry, registry) {
 const marker=entry.body.indexOf('<!-- V3 RESEARCH SUPPLEMENT');
 if(marker<0&&!entry.data.researchImport)return entry.body;
 const prefix=marker<0?'':entry.body.slice(0,marker);
 let text=marker<0?entry.body:entry.body.slice(marker);
 const names=new Map();
 for(const e of registry.list(entry.requestedLocale))for(const name of [e.data.id,e.data.name,e.data.title,e.data.romanizedName,...(e.data.aliases||[])]){
  if(!name)continue;const key=name.normalize('NFKC').toLowerCase();const old=names.get(key);names.set(key,old&&old!==e.data.id?null:e.data.id);
 }
 text=text.replace(/\[\[([^\]\n]+)\]\]/g,(whole,value)=>{
  const [target,...label]=value.split('|');const id=names.get(target.trim().normalize('NFKC').toLowerCase());
  return id?`[[${id}|${label.join('|')||target}]]`:label.at(-1)||target;
 }).replace(/\[(https?:\/\/[^\s\]]+)\s+([^\]]+)\]/g,'[$2]($1)')
 .replace(/'''([^\n]+?)'''/g,'**$1**').replace(/''([^\n]+?)''/g,'*$1*')
 .replace(/^(\*+)(?=\S)/gm,'$1 ').replace(/^=+\s*(.*?)\s*=+$/gm,'## $1');
 // Innermost templates first. Preserve every parameter value, including unsupported templates.
 for(let pass=0;pass<20&&/\{\{[^{}]*\}\}/.test(text);pass++){
  const previous=text;
  text=text.replace(/\{\{([^{}]*)\}\}/g,(whole,inner)=>{
   if(/^(?:\/?(?:details|ruby|lyrics|media|spoiler|mark|kbd|small|sup|sub|abbr|time))(?:::|$)/.test(inner))return whole;
   const [name,...args]=inner.split('|');
   if(!args.length)return `*${name.trim()}*`;
   if(['ljd','lang','lang-ja','lang-en','nowrap'].includes(name.trim()))return args.join(' ');
   if(name.trim()==='导航标题')return `\n\n### ${args.join(' ')}\n\n`;
   if(name.trim()==='Hide'){const title=args.find(a=>a.startsWith('标题='))?.slice(3)||name;const body=args.filter(a=>!a.startsWith('标题=')).map(a=>a.replace(/^内容=/,'')).join('\n');return `\n\n**${title}**\n\n${body}\n\n`;}
   return '\n\n'+args.map(a=>{const pair=a.match(/^\s*([^=\n]+)\s*=([\s\S]*)$/);return pair?`- **${pair[1].trim()}**：${pair[2].trim()}`:a.trim();}).filter(Boolean).join('\n')+'\n\n';
  });
  if(previous===text)break;
 }
 return prefix+text;
}
