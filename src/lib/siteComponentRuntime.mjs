import {siteComponentVersion} from '../generated/siteComponentVersion.mjs';
let runtime;
export function loadSiteComponents(){
 if(!document.querySelector('link[data-site-components]')){const css=document.createElement('link');css.rel='stylesheet';css.href='/_ui/site-components.css?v='+siteComponentVersion;css.dataset.siteComponents='';document.head.append(css);}
 return runtime ||= new Promise((resolve,reject)=>{
  if(window.WikiSiteComponents?.version===siteComponentVersion){resolve(window.WikiSiteComponents);return;}
  const script=document.createElement('script');script.type='module';script.src='/_ui/site-components.js?v='+siteComponentVersion;
  script.onload=()=>window.WikiSiteComponents?.version===siteComponentVersion?resolve(window.WikiSiteComponents):reject(Error('Site component runtime unavailable'));
  script.onerror=()=>{script.remove();reject(Error('Site component runtime failed to load'));};document.head.append(script);
 }).catch(error=>{runtime=null;throw error;});
}
