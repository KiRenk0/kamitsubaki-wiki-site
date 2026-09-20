// Persistence adapter for the shared encyclopedia workbench. Editing stays in visualEditor.js.
export function initializeArticleSubmission(root,editor){
 const $=selector=>root.querySelector(selector),status=$('[data-article-status]');
 const locale=root.dataset.contentLocale,requestedId=new URL(location.href).searchParams.get('id');
 const key=`article-submission:${locale}:${requestedId||'new'}`;
 let state={},busy=false,offset=0,next=null,needsRestore=false;
 try{state=JSON.parse(localStorage.getItem(key)||'{}');}catch{}
 const persist=()=>{localStorage.setItem(key,JSON.stringify(state));$('[data-locale-select]').disabled=Boolean(state.articleId);};
 $('[data-locale-select]').disabled=Boolean(state.articleId);
 const say=text=>{status.textContent=text;};
 const call=async(path,method='GET',body)=>{const res=await fetch(root.dataset.articleApi+'/api/articles'+path,{method,credentials:'include',signal:AbortSignal.timeout(15000),headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const data=await res.json();if(!res.ok)throw Error(data.error?.message||'文章服务暂不可用');return data;};
 const run=async(action)=>{if(busy)return;busy=true;try{await action();}catch(error){say(error.message);}finally{busy=false;}};
 const save=async()=>{if(needsRestore)throw Error('请先从我的提案载入服务端草稿，或明确新建文章。');if(state.submitted)throw Error('这份提案已经提交。请从我的提案查看状态，或新建文章。');const draft=editor.snapshot();const result=await call('/drafts?locale='+(state.locale||draft.locale),'POST',{revisionId:state.revisionId,articleId:state.articleId,baseVersion:state.baseVersion,content:draft.content});state={...state,revisionId:result.revisionId,articleId:result.id,locale:result.locale};persist();say('草稿已保存到文章数据库。');return result;};
 const text=(tag,value)=>{const node=document.createElement(tag);node.textContent=value;return node;};
 const load=async()=>{const result=await call('/mine?offset='+offset),list=$('[data-article-proposals]');next=result.nextOffset;list.replaceChildren();for(const item of result.revisions){const card=text('section','');card.className='ve-article-proposal';card.append(text('h3',item.content.title||'未命名草稿'),text('p',`${item.locale} · ${{draft:'草稿',pending:'待审核',approved:'已批准',rejected:'已退回'}[item.status]}`));if(item.review_note)card.append(text('p',item.review_note));if(['draft','rejected'].includes(item.status)){const button=text('button',item.status==='draft'?'继续编辑':'修改后重新投稿');button.onclick=()=>run(async()=>{if(editor.hasLocalWork()&&!confirm('载入此提案将替换当前编辑区，是否继续？'))return;state={revisionId:item.status==='draft'?item.id:null,articleId:item.article_id,baseVersion:item.base_version,locale:item.locale};if(item.status==='rejected'){try{const current=await call('/items/'+item.article_id+'?locale='+item.locale);state.baseVersion=current.article.version;}catch(error){if(item.base_version===0){delete state.articleId;state.baseVersion=0;}else throw error;}}editor.restore(item.content,item.locale);needsRestore=false;persist();$('[data-article-dialog]').close();say('已载入文章提案。');});card.append(button);}list.append(card);}if(!result.revisions.length)list.append(text('p','暂无文章提案。'));$('[data-article-prev]').hidden=offset===0;$('[data-article-next]').hidden=next===null;};
 $('[data-article-save]').onclick=()=>run(save);
 $('[data-article-submit]').onclick=()=>run(async()=>{await save();await call('/revisions/'+state.revisionId+'/submit','POST',{});state.submitted=true;persist();say('已提交审核，批准前不会改变公开正文。');});
 $('[data-article-mine]').onclick=()=>run(async()=>{offset=0;await load();$('[data-article-dialog]').showModal();});
 $('[data-article-prev]').onclick=()=>run(async()=>{offset=Math.max(0,offset-20);await load();});
 $('[data-article-next]').onclick=()=>run(async()=>{if(next!==null){offset=next;await load();}});
 $('[data-article-new]').onclick=()=>{if(editor.hasLocalWork()&&!confirm('新建文章将清空当前编辑区，请先保存需要保留的草稿。继续吗？'))return;state={};needsRestore=false;persist();editor.restore({body:''},locale);say('已新建文章。');};
 run(async()=>{if(requestedId&&!state.articleId){const {article}=await call('/items/'+encodeURIComponent(requestedId)+'?locale='+locale);if(editor.hasLocalWork()){needsRestore=true;say('已恢复本地编辑内容。请先保存草稿，再从文章阅读页载入公开版本。');return;}state={articleId:article.id,baseVersion:article.version,locale:article.locale};editor.restore(article,article.locale);persist();}else if(state.revisionId&&!editor.hasLocalWork()){needsRestore=true;say('请从我的提案中载入服务端草稿。');return;}say(state.submitted?'当前提案已提交审核，可在我的提案中查看状态。':'使用词条编辑器撰写文章，保存与审核走文章数据库。');});
}
