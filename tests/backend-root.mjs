import {existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
// Normal sibling repositories and isolated integration worktrees share the suite.
const candidates=process.env.WIKI_BACKEND_CHECKOUT?[resolve(process.env.WIKI_BACKEND_CHECKOUT)]:[resolve('../backend'),resolve('../kamitsubaki-wiki-site-backend')];
export const backendRoot=candidates.find(root=>existsSync(join(root,'src/editor/domain.js')));
export const backendReady=Boolean(backendRoot&&['migrations/0021_articles.sql','migrations/0023_article_ownership.sql'].every(file=>existsSync(join(backendRoot,file))));
export function backendPath(file){if(!backendReady)throw Error('This integration test requires a matching backend checkout.');return join(backendRoot,file);}
export function backendURL(file){return pathToFileURL(backendPath(file)+(file?'':'/'));}
