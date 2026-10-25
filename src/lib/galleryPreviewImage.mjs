/** Keep full-size sources in viewer data; only display elements receive previews. */
export function galleryPreviewAttributes(source, {api, sizes='(max-width: 700px) 44vw, 280px', widths=[192,480,960], local={}, imageOrigin='https://images.kamitsubaki.wiki'}={}) {
 if(local[source])return local[source];
 let url;try{url=new URL(source);}catch{return {src:source};}
 if(!api||url.origin!==imageOrigin||!/^\/gallery\/[\w/-]+\.(?:png|jpe?g|webp|gif)$/i.test(url.pathname)||url.search||url.hash)return {src:source};
 const candidates=widths.filter(width=>[192,480,960].includes(width));
 if(!candidates.length)return {src:source};
 const route=width=>`${api.replace(/\/$/,'')}/api/gallery/thumbnails/${width}${url.pathname}`;
 return {src:route(candidates[0]),srcset:candidates.map(width=>`${route(width)} ${width}w`).join(', '),sizes};
}
export function applyGalleryPreview(image, item, options) {
 const original=item.thumbnail||item.src;
 image.dataset.previewOriginal=original;
 const attrs=galleryPreviewAttributes(original,options);
 image.src=attrs.src;
 if(attrs.srcset)image.srcset=attrs.srcset;
 else image.removeAttribute('srcset');
 if(attrs.sizes)image.sizes=attrs.sizes;
 image.decoding='async';
 if(item.width&&item.height){image.width=item.width;image.height=item.height;}
 // An old backend or transient transform failure keeps artwork usable. Do not
 // retry forever, and clear srcset so the browser actually uses the fallback.
 image.onerror=()=>{image.onerror=null;image.removeAttribute('srcset');image.src=original;};
}
