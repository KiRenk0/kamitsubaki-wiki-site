// Build-specific source destinations. An isolated beta sets both values rather
// than sending corrections or revision-history readers to upstream main.
export function resolveContentRepository(env={}){
 const url=env.PUBLIC_CONTENT_REPOSITORY || 'https://github.com/LinkTh1rsty/kamitsubaki-wiki-site';
 const branch=env.PUBLIC_CONTENT_BRANCH || 'main';
 if(!/^https:\/\/github\.com\/[A-Za-z0-9_-][A-Za-z0-9_.-]*\/[A-Za-z0-9_-][A-Za-z0-9_.-]*$/.test(url))throw Error('Invalid content repository');
 if(!/^[A-Za-z0-9_-][A-Za-z0-9_./-]*$/.test(branch)||branch.includes('..')||branch.endsWith('/')||branch.includes('//'))throw Error('Invalid content branch');
 return {url,branch};
}
export const contentRepository=resolveContentRepository(import.meta.env || {});
export function contentFileUrl(path,mode='edit',repository=contentRepository){
 if(typeof path!=='string'||!path.startsWith('src/content/')||/[\\\s?#%\u0000-\u001f]/.test(path)||path.split('/').some(part=>!part||part.startsWith('.'))||!['edit','new'].includes(mode))throw Error('Invalid content source path');
 const parts=path.split('/').map(encodeURIComponent),filename=parts.pop(),base=repository.url+'/'+mode+'/'+encodeURIComponent(repository.branch)+'/';
 return mode==='new'?base+parts.join('/')+'?filename='+filename:base+[...parts,filename].join('/');
}
export function contentCommitUrl(sha,repository=contentRepository){
 if(!/^[a-f0-9]{7,64}$/.test(sha))throw Error('Invalid content commit');
 return repository.url+'/commit/'+sha;
}
