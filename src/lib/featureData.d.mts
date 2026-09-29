import type {Source} from './entityRegistry.mjs';
export interface EventText {title: string; summary?: string}
export interface ChronicleEvent {
 id:string; date:{start:string; end?:string; precision:string}; era?:string; sourceLocale?:string; publicationVersion?:string;
 tracks:string[]; eventTypes:string[]; importance:string;
 text:Record<string,EventText>; related?:{entity:string;role?:string}[];
 articles?:string[]; sources?:Source[];
}
export interface GalleryItem {
 id:string;subject:string;characters?:string[];form?:string;tags:string[];date?:string;
 image:{src:string;thumbnail?:string;dimensions?:{width:number;height:number}};
 source:Source; notes?:Record<string,string>;uploader:string;uploadedAt:string;
}
export interface Era {id:string;start:string;end:string}
export function loadTaxonomy(name:string):Promise<{values:string[];eras:Era[]}>;
export function loadFeatureData():Promise<{events:ChronicleEvent[];gallery:GalleryItem[];eras:Era[];footprints(id:string):ChronicleEvent[]}>;
export function featureText(text:Record<string,EventText>,locale:string):EventText;
export function featureText(text:Record<string,string>|undefined,locale:string):string;
export function galleryImageUrl(src:string,publicBase?:string):string;
