import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { Editor } from '@tiptap/core';
import { createWikiExtensions } from '../src/editor/extensions';
import { loadWikiDocument, exportWikiDocument } from '../src/lib/wiki-document';

const dom = new JSDOM('<div class="wiki-writing-scroll" style="overflow-y:auto"><div id="editor"></div></div><aside id="sidebar"></aside>', { url: 'http://localhost', pretendToBeVisual: true });
const w = dom.window;
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLIFrameElement', 'HTMLAnchorElement', 'HTMLInputElement', 'Element', 'Node', 'DOMParser', 'DOMRect', 'MutationObserver', 'getComputedStyle', 'ShadowRoot']) Object.defineProperty(globalThis, key, { value: (w as any)[key], configurable: true, writable: true });
let clock = 0, nextFrame = 0; const frames = new Map<number, FrameRequestCallback>();
const actualNow = Date.now; Date.now = () => clock;
const requestFrame = (callback: FrameRequestCallback) => { const id = ++nextFrame; frames.set(id, callback); return id; };
const cancelFrame = (id: number) => { frames.delete(id); };
w.requestAnimationFrame = requestFrame; w.cancelAnimationFrame = cancelFrame;
Object.defineProperty(globalThis, 'requestAnimationFrame', { value: requestFrame, configurable: true });
Object.defineProperty(globalThis, 'cancelAnimationFrame', { value: cancelFrame, configurable: true });
function advance(count = 1) { for (let i = 0; i < count; i++) { clock += 16; const pending = [...frames.values()]; frames.clear(); for (const run of pending) run(clock); } }
const viewport = document.querySelector<HTMLElement>('.wiki-writing-scroll')!;
const sidebar = document.querySelector<HTMLElement>('#sidebar')!;
Object.defineProperties(viewport, { clientHeight: { value: 500 }, scrollHeight: { value: 5000 }, clientWidth: { value: 600 }, scrollWidth: { value: 800 } });
viewport.getBoundingClientRect = () => new w.DOMRect(100, 100, 600, 500);
const scrolling: {top:number;left:number}[] = [];
viewport.scrollBy = ((change: ScrollToOptions) => { scrolling.push({top:change.top || 0,left:change.left || 0}); viewport.scrollTop = Math.max(0, Math.min(4500, viewport.scrollTop + (change.top || 0))); viewport.scrollLeft += change.left || 0; }) as any;
let windowScrolls = 0; w.scrollTo = () => { windowScrolls++; };
let underPointer: Element = viewport;
(document as any).elementFromPoint = () => underPointer;
(document as any).elementsFromPoint = () => [underPointer, viewport, document.body];
const editor = new Editor({ element: document.querySelector('#editor')!, extensions: createWikiExtensions(undefined, true, true), content: '<p>拖动这一段</p><p>中间段落</p><p>放在末尾</p>', editorProps: { handleScrollToSelection: () => true } });
Object.defineProperty(editor.view.dom, 'offsetParent', { get: () => viewport });
editor.view.coordsAtPos = () => ({ left: 150, right: 151, top: 200, bottom: 235 });
const handle = viewport.querySelector<HTMLElement>('[data-drag-handle]')!;
let dropPosition = 0;
editor.view.posAtCoords = () => ({ pos: dropPosition, inside: dropPosition });
function transfer() { const data = new Map<string,string>(); return { files: [], items: [], effectAllowed: 'all', dropEffect: 'none', get types(){return [...data.keys()];}, setData(type:string,value:string){data.set(type,value);}, getData(type:string){return data.get(type)||'';}, clearData(){data.clear();}, setDragImage(){} }; }
function dragEvent(type:string, target:Element, y:number, data:any) {
  const event = new w.MouseEvent(type, {bubbles:true,cancelable:true,clientX:300,clientY:y,button:0});
  Object.defineProperty(event,'dataTransfer',{value:data}); target.dispatchEvent(event); return event;
}
function begin() {
  dropPosition = 0; underPointer = editor.view.dom.firstElementChild!;
  underPointer.getBoundingClientRect = () => new w.DOMRect(150, 200, 500, 35);
  const data = transfer(); dragEvent('dragstart',handle,210,data); advance(2); return data;
}
function end(data:any) { dragEvent('dragend',handle,300,data); advance(2); }
after(() => { editor.destroy(); Date.now = actualNow; dom.window.close(); });

test('scrolling binds after Novel creates its native handle and cleans up on editor destruction', () => {
  assert.ok(handle, 'Novel handle exists');
  assert.equal(viewport.getAttribute('data-auto-scrollable'), 'true', 'actual native auto-scroll binding is installed during editor initialization');
});
test('drag edges scroll only the writing viewport, continue while stationary, reverse and stop in the center', () => {
  viewport.scrollTop = 500; viewport.scrollLeft = 0; scrolling.length = 0;
  const data = begin(); viewport.scrollTop = 500; scrolling.length = 0; assert.ok(editor.view.dragging, 'Novel creates the ProseMirror slice');
  underPointer = editor.view.dom; dragEvent('dragover',editor.view.dom,595,data); advance(2); scrolling.length = 0; advance(110);
  assert.ok(viewport.scrollTop > 900, 'held bottom-edge drag continuously scrolls the inner viewport');
  assert.ok(scrolling.every(change=>change.top >= 0 && change.left === 0), JSON.stringify(scrolling.filter(change=>change.top < 0 || change.left !== 0).slice(0,4)));
  const bottom = viewport.scrollTop;
  dragEvent('dragover',editor.view.dom,105,data); advance(110); assert.ok(viewport.scrollTop < bottom, 'top edge reverses scrolling');
  dragEvent('dragover',editor.view.dom,350,data); advance(2); const center = viewport.scrollTop; advance(40); assert.equal(viewport.scrollTop, center, 'center has no auto-scroll');
  assert.equal(windowScrolls,0,'does not scroll the browser page'); assert.equal(sidebar.scrollTop,0,'does not scroll properties or navigation');
  end(data); const finished = viewport.scrollTop; advance(40); assert.equal(viewport.scrollTop,finished,'dragend stops the loop');
});
test('leaving the editor and canceled drags do not scroll unrelated regions', () => {
  const data = begin(); viewport.scrollTop = 500; underPointer = sidebar;
  dragEvent('dragover',sidebar,595,data); advance(110); assert.equal(viewport.scrollTop,500); assert.equal(sidebar.scrollTop,0);
  end(data); advance(30); assert.equal(viewport.scrollTop,500);
});
test('auto-scroll integration allows the native drop, moves once and participates in undo, redo and Markdown reopening', () => {
  const source = '---\nschemaVersion: 2\nid: drag-test\nlocale: zh\nentityType: editorial-article\ntitle: 测试\n---\n\n拖动这一段\n\n中间段落\n\n放在末尾\n';
  const loaded = loadWikiDocument(editor, source); const data = begin();
  dropPosition = editor.state.doc.content.size; underPointer = editor.view.dom;
  const over = dragEvent('dragover',editor.view.dom,595,data); advance(20);
  assert.equal(over.defaultPrevented,true,'ProseMirror permits a native drop');
  dragEvent('drop',editor.view.dom,450,data); advance(2);
  assert.deepEqual([...Array(editor.state.doc.childCount)].map((_,i)=>editor.state.doc.child(i).textContent),['中间段落','放在末尾','拖动这一段']);
  const moved = exportWikiDocument(editor,loaded.context,loaded.metadata);
  assert.equal(editor.commands.undo(),true); assert.equal(exportWikiDocument(editor,loaded.context,loaded.metadata),source);
  assert.equal(editor.commands.redo(),true); assert.equal(exportWikiDocument(editor,loaded.context,loaded.metadata),moved);
  loadWikiDocument(editor,moved); assert.equal(editor.state.doc.lastChild!.textContent,'拖动这一段');
});
test('teardown removes the viewport registration and does not leave a live scroll binding', () => {
  editor.destroy(); assert.equal(viewport.hasAttribute('data-auto-scrollable'),false); assert.equal(viewport.querySelector('[data-drag-handle]'),null);
});
