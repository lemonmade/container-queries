import Query from './Query';
import ResizeDetector from './ResizeDetector';

export class ContainerQuery {
  constructor(node, queries = [], {resizeDetectorCreator = ResizeDetector.for} = {}) {
    this.node = node;
    this.width = 0;
    this.queries = queries.map((query) => new Query(query));

    this.update = ::this.update;
    this.resizeDetector = resizeDetectorCreator(this.node && this.node.parentNode);
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

  addQuery(query) {
    let newQuery = new Query(query);
    this.queries.push(newQuery);
    this.update();
    return newQuery;
  }

  addQueries(allQueries) {
    let newQueries = allQueries.map((options) => new Query(options));
    this.queries = this.queries.concat(newQueries);
    this.update();
    return newQueries;
  }

  destroy() {
    this.queries = [];
    delete this.node;

    if (this.resizeDetector != null) {
      this.resizeDetector.removeListener(this.update);
      delete this.resizeDetector;
    }
  }
}

export class MultipleNodeContainerQuery {
  constructor(nodes, queries, options) {
    this.containerQueries = toArray(nodes).map((node) => new ContainerQuery(node, queries, options));
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
