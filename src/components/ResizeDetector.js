import UIComponent from './UIComponent';

export default class ResizeDetector extends UIComponent {
  constructor(node) {
    super(node);
    this._listeners = [];
    this.update = ::this.update;
  }

  get width() {
    return (this.node == null) ? 0 : this.node.offsetWidth;
  }

  get hasLoaded() {
    return (this.object != null) && (this.object.contentDocument != null) && (this.object.contentDocument.readyState === 'complete');
  }

  update() {
    let {width, _listeners} = this;
    _listeners.forEach((listener) => listener(width));
  }

  addListener(callback) {
    this.object = this.object || createResizeObject(this);
    this._listeners.push(callback);
    if (this.hasLoaded) { callback(this.width); }
  }

  removeListener(callback, {preserve = false} = {}) {
    this._listeners.splice(this._listeners.indexOf(callback), 1);
    if (!preserve && this._listeners.length === 0) { this.destroy(); }
  }

  destroy() {
    if (this.object && this.object.contentDocument) {
      this.object.contentDocument.defaultView.removeEventListener('resize', this.update);
    }

    this._listeners = [];
    super.destroy();
  }
}

let objectStyle = `
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
`;

function createResizeObject(detector) {
  let {node, update} = detector;
  if (node == null) { return null; }

  let obj = document.createElement('object');
  obj.style.cssText = objectStyle;
  obj.tabindex = -1;

  obj.onload = (event) => {
    let content = event.target.contentDocument.defaultView;
    content.addEventListener('resize', update);
    update();

    delete obj.onload;
  };

  obj.data = 'about:blank';

  positionNodeRelatively(node);
  node.appendChild(obj);
  return obj;
}

let relativePositionValues = ['relative', 'absolute', 'fixed'];

function positionNodeRelatively(node) {
  if (relativePositionValues.indexOf(getComputedStyle(node, 'position')) < 0) {
    node.style.position = 'relative';
  }
}

function getComputedStyle(element, prop) {
  return window.getComputedStyle(element, null).getPropertyValue(prop);
}
