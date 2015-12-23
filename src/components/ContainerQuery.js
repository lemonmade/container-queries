import Query from './Query';
import ResizeDetector from './ResizeDetector';
import {minMaxInclusiveFromIdentifier} from '../range';

export default class ContainerQuery {
  constructor(node, queries = [], {resizeDetectorCreator = ResizeDetector.for} = {}) {
    this.node = node;
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

    node.setAttribute('data-container-query-matches', matches.join(' '));
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

const queryExtractor = /([^:,\s]+):\s+([^,\s]+)/g;

function queriesFromNode(node) {
  let attribute = node.getAttribute('data-container-queries');
  if (!attribute) { return []; }

  let queries = [];
  let match = queryExtractor.exec(attribute);

  while (match) {
    queries.push({
      identifier: match[1].trim(),
      ...minMaxInclusiveFromIdentifier(match[2].trim()),
    });

    match = queryExtractor.exec(attribute);
  }

  return queries;
}
