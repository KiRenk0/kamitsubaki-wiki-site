import { readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
export function entrySourcePath(entry) { return relative(process.cwd(),resolve(entry.filePath)).replaceAll('\\','/'); }
export function readEditorSource(path) { return readFile(resolve(path),'utf8'); }
