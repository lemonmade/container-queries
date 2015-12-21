import Query from './Query';
import ResizeDetector from './ResizeDetector';

export class ContainerQuery {
  constructor(node, resizeDetectorFactory = ResizeDetector.for) {
    this.node = node;
    this.width = 0;
    this.queries = [];

    this.update = ::this.update;
    this.resizeDetector = resizeDetectorFactory(this.node && this.node.parentNode);
    this.resizeDetector.addListener(this.update);
  }

  update(width = this.resizeDetector.width) {
    let {queries, node} = this;

    let matches = queries.filter((query) => {
      query.update(width);
      return query.matches;
    }).map((query) => query.identifier);

    node.setAttribute('data-matching-queries', matches.join(' '));
  }

  addQuery(options) {
    let newQuery = new Query(options);
    this.queries.push(newQuery);
    return newQuery;
  }

  destroy() {
    this.queries = [];
    delete this.node;

    this.resizeDetector.removeListener(this.update);
    delete this.resizeDetector;
  }
}

export class MultipleNodeContainerQuery {
  constructor(nodes, resizeDetectorFactory) {
    this.containerQueries = toArray(nodes).map((node) => new ContainerQuery(node, resizeDetectorFactory));
  }

  update() {
    this.containerQueries.forEach((cq) => cq.update());
  }

  addQuery(options) {
    this.containerQueries.forEach((cq) => cq.addQuery(options));
  }

  destroy() {
    this.containerQueries.forEach((cq) => cq.destroy());
  }
}

function toArray(arrayLike) {
  return Array.prototype.slice.apply(arrayLike);
}
