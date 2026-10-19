// Route only to existing ownership-checked editors. Never accept a supplied URL.
export function reviewEditorPath(locale,kind,editor={}) {
 const lang=['zh','zh-tw','zh-hk','ja','en'].includes(locale)?locale:'zh';
 const resource=encodeURIComponent(editor.resourceId||'');
 if(!resource)return null;
 if(kind==='entries')return `/${lang}/contribute/editor/?view=submissions&submission=${resource}`;
 if(kind==='timeline')return `/${lang}/chronicle/submit/?submission=${resource}`;
 if(kind==='community')return `/${lang}/community/activities/apply/?revision=${resource}`;
 if(kind==='sets')return `/${lang}/gallery/manage/?revision=${resource}`;
 if(kind==='gallery')return editor.batchId ? `/${lang}/gallery/manage/photos/?retry=${encodeURIComponent(editor.batchId)}` : `/${lang}/gallery/manage/legacy/?revision=${resource}`;
 return null;
}
