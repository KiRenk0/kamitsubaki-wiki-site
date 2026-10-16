import zhCN from '@uppy/locales/lib/zh_CN.js';
import zhTW from '@uppy/locales/lib/zh_TW.js';
import ja from '@uppy/locales/lib/ja_JP.js';
import en from '@uppy/locales/lib/en_US.js';
// Hong Kong and Taiwan share Uppy's official Traditional Chinese pack.
export const uploadLocale=locale=>locale==='en'?en:locale==='ja'?ja:['zh-tw','zh-hk'].includes(locale)?zhTW:zhCN;
