import ContainerQuery from './ContainerQuery';

export default class MultipleNodeContainerQuery {
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
