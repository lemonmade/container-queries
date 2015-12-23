import ContainerQuery from './ContainerQuery';
import MultipleNodeContainerQuery from './MultipleNodeContainerQuery';

export default function containerQuery(nodes, queries, options) {
  if (typeof nodes === 'string') {
    return new MultipleNodeContainerQuery(document.querySelectorAll(nodes), queries, options);
  }

  if (nodes.length != null) {
    return new MultipleNodeContainerQuery(nodes, queries, options);
  }

  return new ContainerQuery(nodes, queries, options);
}
