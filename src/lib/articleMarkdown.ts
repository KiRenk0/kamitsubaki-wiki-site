import {parseVisualBlocks} from './visualEditor.mjs';
import {previewBlock} from './editorPreview.mjs';
import {editorCopy} from './visualEditorCopy.mjs';
// The same block renderer is used by the shared workbench and published articles.
export const articleHTML=(body:string,locale='zh')=>parseVisualBlocks(body).map(block=>previewBlock(block,editorCopy(locale))).join('\n');
