import {blockMarkdown, escapeHtml} from '../../../../src/lib/visualEditor.mjs';

export function imageDimension(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const text = String(value).trim();
  if (!/^\d+(?:px)?$/.test(text)) return null;
  const number = Number(text.replace(/px$/, ''));
  return Number.isSafeInteger(number) && number > 0 && number <= 16000 ? number : null;
}

export function imageFigureAttributes(element: HTMLElement) {
  const children = Array.from(element.children);
  if (element.tagName !== 'FIGURE' || element.attributes.length || children.length > 2 || children[0]?.tagName !== 'IMG' || children[1] && children[1].tagName !== 'FIGCAPTION') return false;
  const image = children[0] as HTMLImageElement;
  if (Array.from(element.childNodes).some(node => node.nodeType === 3 && node.textContent?.trim()) || Array.from(image.attributes).some(attribute => !['src','alt','title','width','height'].includes(attribute.name)) || children[1] && (children[1].attributes.length || children[1].children.length)) return false;
  return {src: image.getAttribute('src'), alt: image.getAttribute('alt') || '', title: image.getAttribute('title'), caption: children[1]?.textContent || '', width: imageDimension(image.getAttribute('width')), height: imageDimension(image.getAttribute('height'))};
}

export function imageMarkdown(attrs: Record<string, any>) {
  const width = imageDimension(attrs.width), height = imageDimension(attrs.height);
  if (!width && !height) return blockMarkdown({type: 'image', text: attrs.alt || '', url: attrs.src, caption: attrs.caption || ''});
  const attributes = publicImageAttributes(attrs);
  const image = '<img ' + Object.entries(attributes).map(([key, value]) => `${key}="${escapeHtml(String(value))}"`).join(' ') + '>';
  return attrs.caption ? `<figure>${image}<figcaption>${escapeHtml(attrs.caption)}</figcaption></figure>` : image;
}
export function publicImageAttributes(attrs: Record<string, any>) {
  const width=imageDimension(attrs.width),height=imageDimension(attrs.height);
  return {src:attrs.src,alt:attrs.alt||'',...(attrs.title?{title:attrs.title}:{}),...(width?{width}:{}),...(height?{height}:{})};
}
