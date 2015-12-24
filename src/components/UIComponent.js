import DOMCache from './DOMCache';

export default class UIComponent {
  static get identifier() {
    return this.name;
  }

  static for(node) {
    if (node == null) { return null; }
    return DOMCache.getValueForNode(node, {key: this.identifier});
  }

  static create(nodes, ...args) {
    if (nodes instanceof window.HTMLElement) {
      return this.for(nodes) || new this(nodes, ...args);
    }

    if (typeof nodes === 'string') {
      nodes = document.querySelectorAll(nodes);
    }

    return toArray(nodes)
      .map((node) => this.for(node) || new this(node, ...args));
  }

  static allWithin(root) {
    return allNodesWithin(root, {matchingSelector: this.selector})
      .map((node) => this.for(node))
      .filter((component) => component != null);
  }

  static createAllWithin(root, ...args) {
    return this.create(allNodesWithin(root, {matchingSelector: this.selector}), ...args);
  }

  static destroyAllWithin(root) {
    this.allWithin(root).forEach((component) => component.destroy());
  }

  constructor(node) {
    this.node = node;

    if (node != null) {
      DOMCache.setValueForNode(node, {key: this.constructor.identifier, value: this});
    }
  }

  destroy() {
    if (this.node != null) {
      DOMCache.deleteValueForNode(this.node, {key: this.constructor.identifier});
      delete this.node;
    }
  }
}

function allNodesWithin(root, {matchingSelector: selector}) {
  if (selector == null) { return []; }
  return toArray(root.querySelectorAll(selector));
}

function toArray(arrayLike) {
  return Array.prototype.slice.apply(arrayLike);
}
