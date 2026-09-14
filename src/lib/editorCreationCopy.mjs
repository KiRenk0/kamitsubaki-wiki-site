import {resolveLocaleCopy} from './i18n.mjs';
const phrases=[
 ['GitHub 原图上传与路径教程 ↗','GitHub original upload and path guide ↗','GitHub原本アップロード・パスのガイド ↗'],
 ['请先修正源码，再操作附件。','Fix the source before changing attachments.','添付を操作する前にソースを修正してください。'],
 ['恢复上一份本地草稿','Restore previous local draft','前のローカル下書きを復元'],
 ['条目目录','Entry folder','記事フォルダー'],
 ['使用小写英文、数字和连字符，可用 / 分组。提交时会检查重名，繁体中文由简体生成。','Use lowercase letters, digits and hyphens; / separates groups. Existing paths are checked on submission. Traditional Chinese is generated.','英小文字・数字・ハイフンを使用し、/ で分類できます。送信時に重複を確認します。繁体字は自動生成されます。'],
 ['原图不压缩、不缩放、不转格式。站内附件每张最多 750 KB、最多 8 张、合计 4 MB；更大的原图请按教程直接上传 GitHub。','Original files are kept without compression, resizing or conversion. In-site attachments: 750 KB each, up to 8 images, 4 MB total. Upload larger originals through GitHub using the guide.','原本は圧縮・縮小・形式変換しません。サイト内添付は1枚750 KB、最大8枚、合計4 MB。大きい原本はガイドに従ってGitHubへ直接アップロードしてください。'],
 ['选择图片','Select images','画像を選択'],['图片说明','Alt text','代替テキスト'],['来源或授权说明','Source or permission','出典・使用許可'],
 ['官方页面链接，或原创 / 授权说明','Official source URL, or authorship / permission details','公式URL、または自作・使用許可の説明'],
 ['加入附件','Add images','添付に追加'],['插入正文','Insert into article','本文に挿入'],['设为封面','Use as cover','カバーに設定'],['移除附件','Remove image','添付を削除'],
 ['请先选择、拖入或粘贴图片。','Select, drop or paste an image first.','画像を選択・ドロップ・貼り付けしてください。'],
 ['最多添加 8 张图片。','Up to 8 images are allowed.','画像は最大8枚です。'],['正在保存原图…','Saving original images…','原本を保存中…'],
 ['附件合计不能超过 4 MB。','Images must total 4 MB or less.','画像の合計は4 MB以下にしてください。'],
 ['已保存在本机，提交审核时上传。','Saved locally. Images upload when you submit.','端末に保存しました。審査への送信時にアップロードします。'],
 ['请先移除正文或封面中的图片引用，再移除附件。','Remove this image from the article and cover before removing the attachment.','先に本文やカバーから画像を外してください。'],
 ['请先修正源码，再创建新条目。','Fix the source before creating a new article.','新規記事を作成する前にソースを修正してください。'],
 ['没有上一份本地草稿。','There is no previous local draft.','前のローカル下書きはありません。'],
 ['图片校验失败，请重新选择。','Image verification failed. Select the image again.','画像の検証に失敗しました。選択し直してください。'],
 ['请选择 PNG、JPEG 或 WebP 原图。','Choose an original PNG, JPEG or WebP image.','PNG・JPEG・WebPの原本を選択してください。'],
 ['请填写图片来源或授权说明。','Provide the image source or permission details.','画像の出典または使用許可を記入してください。'],
 ['原图超过 750 KB，请按图片教程直接上传 GitHub，再填写图片路径。','The original exceeds 750 KB. Follow the image guide to upload it through GitHub and enter its path.','原本が750 KBを超えています。ガイドに従いGitHubへアップロードしてパスを入力してください。'],
 ['请使用小写英文、数字和连字符填写目录，可用 / 分组。','Use lowercase letters, digits and hyphens in the folder, with / for groups.','フォルダーには英小文字・数字・ハイフンを使い、/ で分類してください。'],
];
export function creationDictionary(locale){return Object.fromEntries(phrases.map(([zh,en,ja])=>[zh,resolveLocaleCopy({zh,en,ja},locale)]));}
export function creationCopy(locale){const map=creationDictionary(locale);return text=>map[text]||text;}
