import {themeStorageKey,accentStorageKey,normalizeTheme,normalizeAccent,resolveTheme} from '../lib/appearance.mjs';
const media=window.matchMedia('(prefers-color-scheme: dark)');
const root=document.documentElement;
function updateOptions(){
 for(const [selector,key,current] of [['[data-theme-toggle]','themeValue',root.dataset.themePreference],['[data-accent-toggle]','accentValue',root.dataset.interfaceAccent]]){
  document.querySelectorAll(selector).forEach(button=>{const selected=button.dataset[key]===current;button.setAttribute('aria-checked',String(selected));button.classList.toggle('is-active',selected);button.tabIndex=selected?0:-1;});
 }
}
function apply({theme=root.dataset.themePreference,accent=root.dataset.interfaceAccent}={},persist=false){
 const preference=normalizeTheme(theme),color=normalizeAccent(accent);
 root.dataset.themePreference=preference;root.dataset.theme=resolveTheme(preference,media.matches);root.dataset.interfaceAccent=color;updateOptions();
 if(persist)try{localStorage.setItem(themeStorageKey,preference);localStorage.setItem(accentStorageKey,color);}catch{/* Keep the current visual choice even when storage is unavailable. */}
}
function initialize(){
 apply();
 document.addEventListener('click',event=>{const button=event.target instanceof Element&&event.target.closest('[data-theme-toggle],[data-accent-toggle]');if(!(button instanceof HTMLButtonElement))return;apply(button.hasAttribute('data-theme-toggle')?{theme:button.dataset.themeValue}:{accent:button.dataset.accentValue},true);});
 document.addEventListener('keydown',event=>{const target=event.target;if(!(target instanceof HTMLButtonElement)||!target.matches('[data-theme-toggle],[data-accent-toggle]'))return;const group=target.closest('[role=radiogroup]');if(!group)return;const buttons=[...group.querySelectorAll('button[role=radio]')],index=buttons.indexOf(target);const next=['ArrowRight','ArrowDown'].includes(event.key)?(index+1)%buttons.length:['ArrowLeft','ArrowUp'].includes(event.key)?(index+buttons.length-1)%buttons.length:event.key==='Home'?0:event.key==='End'?buttons.length-1:-1;if(next<0)return;event.preventDefault();buttons[next].focus();buttons[next].click();});
 window.addEventListener('storage',event=>{if(!event.key||[themeStorageKey,accentStorageKey].includes(event.key))try{apply({theme:localStorage.getItem(themeStorageKey),accent:localStorage.getItem(accentStorageKey)});}catch{}});
 media.addEventListener('change',()=>apply());
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
