import {foldCjkSearchText} from './cjkSearch.mjs';

export const UNKNOWN_RECORD_YEAR='__unknown__';

/** Read an authored release date; never infer a year from a title or relationship. */
export function readerRecordYear(value){
 return typeof value==='string'&&/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(value.trim())?value.trim().slice(0,4):'';
}

/** @param {{title?:string,searchTerms?:string[]}} record */
export function readerRecordSearchText(record){
 return foldCjkSearchText([record.title,...(record.searchTerms||[])].filter(value=>typeof value==='string').join(' '));
}

/** @param {{search:string,year:string}[]} records */
export function filterReaderRecords(records,query='',year=''){
 const terms=foldCjkSearchText(query).split(' ').filter(Boolean);
 return records.filter(record=>(!year||(year===UNKNOWN_RECORD_YEAR?!record.year:record.year===year))&&terms.every(term=>record.search.includes(term)));
}
