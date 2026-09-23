import {enhanceImageLinks} from '../lib/imageViewer.mjs';
import { enhanceReader } from '../lib/readerEnhancements.mjs';
const initialize = () => document.querySelectorAll('.wiki-reader:not([data-preview]),.wiki-infobox').forEach(root => {enhanceReader(root);enhanceImageLinks(root);});
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize,{once:true});
else initialize();
