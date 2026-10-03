import assert from 'node:assert/strict';
import test from 'node:test';
import {mountEditorSidebar} from '../src/lib/editorSidebar.mjs';

class Element extends EventTarget {
  constructor(document, {dataset = {}, parent = null, role = '', classes = []} = {}) {
    super();
    this.ownerDocument = document;
    this.dataset = dataset;
    this.parent = parent;
    this.role = role;
    this.classes = classes;
    this.attributes = new Map();
    this.hidden = false;
    this.inert = false;
    this.lookups = new Map();
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  hasAttribute(name) { return this.attributes.has(name); }
  removeAttribute(name) { this.attributes.delete(name); }
  querySelector(selector) { return this.lookups.get(selector) ?? null; }
  closest(selector) {
    for (let node = this; node; node = node.parent) {
      if (selector === 'details' && node.role === 'details') return node;
      if (selector === '.ve-activity' && node.classes.includes('ve-activity')) return node;
    }
    return null;
  }
  contains(node) { for (let current = node; current; current = current.parent) if (current === this) return true; return false; }
  focus() { this.ownerDocument.activeElement = this; }
  click() { this.dispatchEvent(new Event('click')); }
}

function fixture() {
  const document = {activeElement:null};
  const root = new Element(document, {dataset:{side:'outline'}});
  root.setAttribute('data-sidebar-hidden', '');
  const aside = new Element(document, {parent:root});
  const rail = new Element(document, {parent:root,classes:['ve-activity']});
  const menu = new Element(document, {parent:root,role:'details'});
  const summary = new Element(document, {parent:menu});
  menu.lookups.set('summary', summary);
  const canvas = new Element(document, {parent:root});
  const panels = Object.fromEntries(['outline','files','properties'].map(side => [side,new Element(document,{parent:aside,dataset:{sidePanel:side}})]));
  const buttons = Object.fromEntries(['outline','files','properties'].map(side => [side,new Element(document,{parent:rail,dataset:{sideButton:side}})]));
  const menuProperties = new Element(document,{parent:menu,dataset:{sideButton:'properties'}});
  const documentProperties = new Element(document,{parent:canvas,dataset:{sideButton:'properties'}});
  const propertySelect = new Element(document,{parent:panels.properties});
  panels.properties.lookups.set('[data-locale-select], input, select',propertySelect);
  const closeButton = new Element(document,{parent:panels.files});
  const toggleButton = new Element(document,{parent:rail});
  root.querySelector = selector => {
    if(selector === '.ve-sidebar') return aside;
    if(selector === '[data-sidebar-toggle]') return toggleButton;
    const match = selector.match(/^\.ve-activity \[data-side-button="(\w+)"\]$/);
    return match ? buttons[match[1]] : null;
  };
  root.querySelectorAll = selector => ({
    '[data-side-panel]':Object.values(panels),
    '[data-side-button]':[...Object.values(buttons),menuProperties,documentProperties],
    '[data-sidebar-close]':[closeButton],
  })[selector] ?? [];
  const revealed = [];
  let filesOpened = 0;
  const controller = mountEditorSidebar(root,{revealPanel:panel=>revealed.push(panel.dataset.sidePanel),onOpenFiles:()=>filesOpened++});
  return {document,root,aside,panels,buttons,menuProperties,documentProperties,propertySelect,closeButton,toggleButton,summary,revealed,controller,get filesOpened(){return filesOpened;}};
}

test('clicking the active outline button closes it; Files and Properties use the same toggle behavior', () => {
  const ui = fixture();
  assert.equal(ui.aside.inert,true);
  assert.equal(ui.buttons.outline.getAttribute('aria-expanded'),'false');
  ui.buttons.outline.click();
  assert.equal(ui.root.hasAttribute('data-sidebar-hidden'),false);
  assert.equal(ui.buttons.outline.getAttribute('aria-pressed'),'true');
  assert.equal(ui.buttons.outline.getAttribute('aria-expanded'),'true');
  assert.equal(ui.toggleButton.getAttribute('aria-expanded'),'true');
  assert.equal(ui.panels.outline.hidden,false);
  ui.buttons.outline.click();
  assert.equal(ui.root.hasAttribute('data-sidebar-hidden'),true);
  assert.equal(ui.buttons.outline.getAttribute('aria-expanded'),'false');
  assert.equal(ui.document.activeElement,ui.buttons.outline);
  ui.buttons.files.click();
  assert.equal(ui.filesOpened,1);
  assert.equal(ui.panels.files.hidden,false);
  assert.equal(ui.buttons.files.getAttribute('aria-pressed'),'true');
  ui.buttons.files.click();
  assert.equal(ui.filesOpened,1,'closing Files must not reload the catalog');
  assert.equal(ui.root.hasAttribute('data-sidebar-hidden'),true);
  ui.buttons.properties.click();
  assert.equal(ui.panels.properties.hidden,false);
  assert.equal(ui.buttons.properties.getAttribute('aria-expanded'),'true');
  ui.buttons.outline.click();
  assert.equal(ui.panels.properties.hidden,true);
  assert.equal(ui.buttons.properties.getAttribute('aria-pressed'),'false');
  assert.deepEqual(ui.revealed,['outline','files','properties','outline']);
});

test('all Properties entry points stay in sync and closing an inner panel returns focus to its rail button', () => {
  const ui = fixture();
  ui.documentProperties.click();
  assert.equal(ui.document.activeElement,ui.propertySelect);
  assert.equal(ui.documentProperties.getAttribute('aria-expanded'),'true');
  assert.equal(ui.menuProperties.getAttribute('aria-expanded'),'true');
  ui.documentProperties.click();
  assert.equal(ui.root.hasAttribute('data-sidebar-hidden'),true);
  assert.equal(ui.document.activeElement,ui.documentProperties);
  ui.menuProperties.click();
  assert.equal(ui.buttons.properties.getAttribute('aria-expanded'),'true');
  ui.menuProperties.click();
  assert.equal(ui.document.activeElement,ui.summary,'closing from a menu must not leave focus in a collapsed menu');
  ui.buttons.files.click();
  ui.closeButton.focus();
  ui.closeButton.click();
  assert.equal(ui.root.hasAttribute('data-sidebar-hidden'),true);
  assert.equal(ui.document.activeElement,ui.buttons.files);
  ui.toggleButton.click();
  assert.equal(ui.buttons.files.getAttribute('aria-expanded'),'true');
  ui.toggleButton.click();
  assert.equal(ui.toggleButton.getAttribute('aria-expanded'),'false');
  assert.equal(ui.document.activeElement,ui.toggleButton);
});
