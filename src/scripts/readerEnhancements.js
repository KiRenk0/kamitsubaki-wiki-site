import { enhanceReader } from '../lib/readerEnhancements.mjs';
const initialize = () => document.querySelectorAll('.wiki-reader:not([data-preview])').forEach(root => enhanceReader(root));
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize,{once:true});
else initialize();
