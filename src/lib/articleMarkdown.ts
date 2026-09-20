import {micromark} from 'micromark';
import {gfm,gfmHtml} from 'micromark-extension-gfm';
export const articleHTML=(body:string)=>micromark(body,{extensions:[gfm()],htmlExtensions:[gfmHtml()],allowDangerousHtml:false,allowDangerousProtocol:false});
