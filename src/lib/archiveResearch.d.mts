import type {ArchiveSnapshot,ArchiveEntity,ArchiveNarrative} from './archiveSnapshot.mjs';
export type ArchiveRecord=ArchiveEntity & ArchiveNarrative & {sourceLocale:string;fallback:boolean};
export const archiveVersion:number;
export const archiveModules:string[];
export function unique<T>(values:Array<T|undefined|null|false>):T[];
export function archiveRecord(snapshot:ArchiveSnapshot,id:string,locale?:string):ArchiveRecord|null;
export function selectArchive(snapshot:ArchiveSnapshot,query?:Record<string,string>,locale?:string):ArchiveRecord[];
export function isDay(value:string):boolean;
export function durationSeconds(value:string):number|null;
