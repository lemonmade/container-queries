import Query from './Query';
import ResizeDetector from './ResizeDetector';

export default class ContainerQuery {
  constructor(node, queries = [], {resizeDetectorCreator = ResizeDetector.for} = {}) {
    this.node = node;
    this.width = 0;
    this.queries = queries.concat(queriesFromNode(node)).map((query) => new Query(query));

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

const dataAttributeRegex = /data-container-query-/;

function queriesFromNode(node) {
  return Array.prototype.slice.call(node.attributes)
    .filter((attr) => dataAttributeRegex.test(attr.name))
    .map((attr) => {
      let identifier = attr.name.replace(dataAttributeRegex, '');
      let value = node.getAttribute(attr.name);
      return {identifier, ...parseContainerQueryValue(value)};
    });
}

function parseContainerQueryValue(value) {
  let parsed = parseInt(value.match(/\d+/), 10);

  if (/^</.test(value)) {
    return {max: parsed};
  } else {
    return {min: parsed};
  }
}
