import { imageAttributes } from './imageAssets.mjs';

// Runs after sanitization, on the server only. The browser receives each image's
// candidates, never the full asset manifest. Unknown/animated sources stay intact.
export default function responsiveMarkdownImages({resolveImage=imageAttributes} = {}) {
  return tree => {
    const visit = (node, inPicture = false) => {
      if (node.type === 'element' && node.tagName === 'img') {
        const props = node.properties || (node.properties = {});
        const source = props.src;
        if (typeof source === 'string' && !inPicture) {
          const attrs = resolveImage(source, { widths: [192, 480, 960], sizes: '(max-width: 767px) calc(100vw - 32px), (max-width: 1279px) 65vw, 720px' });
          if (attrs.srcset) {
            Object.assign(props, attrs, { dataOriginal: source, dataOriginalWidth: attrs.width, dataOriginalHeight: attrs.height });
            props.loading ||= 'lazy';
            props.decoding = 'async';
          }
        }
      }
      for (const child of node.children || []) visit(child, inPicture || node.tagName === 'picture');
    };
    visit(tree);
  };
}
