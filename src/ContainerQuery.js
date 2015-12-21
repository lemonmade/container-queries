import Query from './Query';

export class ContainerQuery {
  constructor(node) {
    this.node = node;
    this.width = 0;
    this.queries = [];
  }

  update() {
    this.width = this._resizeDetector.contentDocument.body.clientWidth;
    let matches = this.queries.filter((query) => {
      query.update(this.width);
      return query.matches;
    }).map((query) => query.identifier);
    this.node.setAttribute('data-matching-queries', matches.join(' '));
  }

  addQuery(options) {
    if (this._resizeDetector == null && this.node.parentNode != null) {
      let resizeDetector = createResizeDetector();

      resizeDetector.onload = (event) => {
        let content = event.target.contentDocument.defaultView;
        content.addEventListener('resize', ::this.update);
        this.update();
      };

      resizeDetector.data = 'about:blank';

      let {parentNode} = this.node;
      positionElementRelatively(parentNode);
      parentNode.appendChild(resizeDetector);

      this._resizeDetector = resizeDetector;
    }

    let newQuery = new Query(options);
    this.queries.push(newQuery);
    return newQuery;
  }
}

export class MultipleNodeContainerQuery {
  constructor(nodes) {
    this.containerQueries = toArray(nodes).map((node) => new ContainerQuery(node));
  }

  update() {
    this.containerQueries.forEach((cq) => cq.update());
  }

  addQuery(options) {
    this.containerQueries.forEach((cq) => cq.addQuery(options));
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

function toArray(arrayLike) {
  return Array.prototype.slice.apply(arrayLike);
}

function createResizeDetector() {
  let obj = document.createElement('object');
  obj.style.cssText = objectStyle;
  obj.tabindex = -1;

  return obj;
}

let relativePositionValues = ['relative', 'absolute', 'fixed'];

function positionElementRelatively(element) {
  if (relativePositionValues.indexOf(getComputedStyle(element, 'position')) < 0) {
    element.style.position = 'relative';
  }
}

function getComputedStyle(element, prop) {
  return window.getComputedStyle(element, null).getPropertyValue(prop);
}
