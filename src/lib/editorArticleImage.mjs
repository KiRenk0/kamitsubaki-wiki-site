const copy = {
  zh: {open:'插入已有图片',title:'插入已有图片',description:'文章可引用已经公开的图片。请使用可直接访问的 HTTPS 图片地址，或本站 /images/ 路径；本机图片不会随文章草稿上传。',url:'图片地址',alt:'图片说明',source:'来源或使用依据',preview:'检查图片',checking:'正在检查图片…',ready:'本机预览成功；请确认访客也能打开此图。',invalid:'请输入 HTTPS 图片地址或本站 /images/ 路径。',unavailable:'图片无法加载。请检查地址及公开权限。',needAlt:'请填写图片说明。',needSource:'请填写来源或使用依据。',insert:'插入正文',cancel:'取消',gallery:'需要投稿新照片？前往图库投稿 ↗'},
  'zh-tw': {open:'插入現有圖片',title:'插入現有圖片',description:'文章可引用已公開的圖片。請使用可直接存取的 HTTPS 圖片網址，或本站 /images/ 路徑；本機圖片不會隨文章草稿上傳。',url:'圖片網址',alt:'圖片說明',source:'來源或使用依據',preview:'檢查圖片',checking:'正在檢查圖片…',ready:'本機預覽成功；請確認訪客也能開啟圖片。',invalid:'請輸入 HTTPS 圖片網址或本站 /images/ 路徑。',unavailable:'圖片無法載入。請檢查網址及公開權限。',needAlt:'請填寫圖片說明。',needSource:'請填寫來源或使用依據。',insert:'插入內文',cancel:'取消',gallery:'需要投稿新照片？前往圖庫投稿 ↗'},
  'zh-hk': {open:'插入現有圖片',title:'插入現有圖片',description:'文章可引用已公開的圖片。請使用可直接存取的 HTTPS 圖片網址，或本站 /images/ 路徑；本機圖片不會隨文章草稿上傳。',url:'圖片網址',alt:'圖片說明',source:'來源或使用依據',preview:'檢查圖片',checking:'正在檢查圖片…',ready:'本機預覽成功；請確認訪客也能開啟圖片。',invalid:'請輸入 HTTPS 圖片網址或本站 /images/ 路徑。',unavailable:'圖片無法載入。請檢查網址及公開權限。',needAlt:'請填寫圖片說明。',needSource:'請填寫來源或使用依據。',insert:'插入內文',cancel:'取消',gallery:'需要投稿新照片？前往圖庫投稿 ↗'},
  ja: {open:'公開画像を挿入',title:'公開画像を挿入',description:'記事には公開済みの画像を引用できます。直接表示できる HTTPS の画像 URL または当サイトの /images/ パスを使用してください。端末内の画像は記事の下書きと共にアップロードされません。',url:'画像 URL',alt:'代替テキスト',source:'出典または使用根拠',preview:'画像を確認',checking:'画像を確認中…',ready:'この端末で表示できました。訪問者も開けることを確認してください。',invalid:'HTTPS の画像 URL または当サイトの /images/ パスを入力してください。',unavailable:'画像を読み込めません。URL と公開設定を確認してください。',needAlt:'代替テキストを入力してください。',needSource:'出典または使用根拠を入力してください。',insert:'本文に挿入',cancel:'キャンセル',gallery:'新しい写真を投稿する場合はギャラリーへ ↗'},
  en: {open:'Insert a published image',title:'Insert a published image',description:'Articles can reference images that are already public. Use a directly accessible HTTPS image URL or this site’s /images/ path. Local files are not uploaded with article drafts.',url:'Image URL',alt:'Alt text',source:'Source or permission',preview:'Check image',checking:'Checking image…',ready:'Preview loaded here. Check that visitors can also open it.',invalid:'Enter an HTTPS image URL or this site’s /images/ path.',unavailable:'The image could not be loaded. Check its URL and public access.',needAlt:'Add alt text for the image.',needSource:'Add the source or permission details.',insert:'Insert into article',cancel:'Cancel',gallery:'Need to submit a new photo? Open the gallery ↗'},
};

export function editorArticleImageCopy(locale) { return copy[locale] || copy.zh; }

export function normalizeArticleImageUrl(input, baseUrl) {
  const raw=String(input??'').trim();
  if(!raw||/[\u0000-\u001f\u007f<>"'\\]/.test(raw))return null;
  try {
    if(raw.startsWith('/')) {
      if(raw.startsWith('//'))return null;
      const url=new URL(raw,baseUrl);
      return url.pathname.startsWith('/images/')&&url.pathname.length>8?url.pathname+url.search:null;
    }
    if(!/^https:\/\//i.test(raw))return null;
    const url=new URL(raw);
    if(url.protocol!=='https:'||url.username||url.password||!url.hostname)return null;
    if(/^(?:localhost|0\.0\.0\.0|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|169\.254(?:\.\d{1,3}){2}|\[?::1\]?|.+\.localhost|.+\.local)$/i.test(url.hostname))return null;
    if(/^172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(url.hostname))return null;
    if(url.hostname==='api.kamitsubaki.wiki'&&/^\/api\/(?:admin\/)?gallery\/(?:revisions|uploads)\//.test(url.pathname))return null;
    return url.href;
  }catch{return null;}
}
