import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
// Astro bundles this helper into dist/.prerender/chunks; resolve against the
// project working directory rather than the generated module's location.
export async function editorAssetManifest(){return JSON.parse(await readFile(resolve('public/_editor/.vite/manifest.json'),'utf8'));}
