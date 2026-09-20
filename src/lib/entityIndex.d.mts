export interface EntityIndexEntry {
 id:string;title:string;aliases:string[];path:string;url:string;locale:string;kind:string;
 entityId:string;translationKey:string;description:string;headings:string[];image?:string;
 titleKey:string;aliasKey:string;descriptionKey:string;headingKey:string;text:string;
}
export function buildEntityIndex(locale:string,origin?:string):Promise<EntityIndexEntry[]>;
