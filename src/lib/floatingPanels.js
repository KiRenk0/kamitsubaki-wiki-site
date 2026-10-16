export const claimFloatingPanel=id=>window.dispatchEvent(new CustomEvent('wiki-floating-panel',{detail:{id}}));
export function onFloatingPanelChange(handler){const listen=event=>handler(event.detail.id);window.addEventListener('wiki-floating-panel',listen);return ()=>window.removeEventListener('wiki-floating-panel',listen);}
