import {ContainerQuery, MultipleNodeContainerQuery} from './ContainerQuery';

export default function containerQuery(nodes) {
  if (typeof nodes === 'string') {
    return new MultipleNodeContainerQuery(document.querySelectorAll(nodes));
  }

  if (nodes.length != null) {
    return new MultipleNodeContainerQuery(nodes);
  }

  return new ContainerQuery(nodes);
}
