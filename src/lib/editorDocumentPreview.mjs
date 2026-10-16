import {parseDocument} from 'yaml';
import {articleHTML} from './articleMarkdownRenderer.mjs';
import {createEntityRegistry} from './entityRegistryCore.mjs';
import {entityDraftRegistry} from './entityDraftRegistry.mjs';
import {renderWikiLinks} from './wikiLinks.mjs';
import {entityInfoModel} from './entityInfoModel.mjs';
export function createEditorPreview(entries,redirects={}){
 const registry=createEntityRegistry(entries,redirects);
 return source=>{
  if(typeof source!=='string'||source.length>1200000)throw Error('正文内容无效或过长。');
  const match=source.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  let metadata={},body=source;
  if(match){const doc=parseDocument(match[1]);if(doc.errors.length)throw Error('文档属性暂时无法解析，请检查后重试。');metadata=doc.toJS({maxAliasCount:100});if(!metadata||Array.isArray(metadata)||typeof metadata!=='object')throw Error('文档属性无效。');body=source.slice(match[0].length);}
  const language=['zh','zh-tw','zh-hk','ja','en'].includes(metadata.locale)?metadata.locale:'zh';
  const current=entityDraftRegistry(registry,metadata,body),linked=renderWikiLinks(articleHTML(body,language),current,language);
  return {...linked,metadata,info:metadata.entityType==='editorial-article'?null:entityInfoModel(metadata,current,language)};
 };
}
