import {parseVisualBlocks} from './visualEditor.mjs';
import {previewBlock} from './editorPreview.mjs';
import {articleCopy} from './articleCopy.mjs';
// The same block renderer is used by the shared workbench and published articles.
export const articleHTML=(body:string,locale='zh')=>parseVisualBlocks(body).map(block=>previewBlock(block,{blocks:{image:articleCopy(locale).image},detailTitle:articleCopy(locale).detailTitle})).join('\n');
