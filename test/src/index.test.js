import '../helper';

import containerQuery from '../../src';
import ContainerQuery from '../../src/components/ContainerQuery';
import MultipleNodeContainerQuery from '../../src/components/MultipleNodeContainerQuery';

describe('containerQuery', () => {
  let nodeOne;
  let nodeTwo;

  beforeEach(() => {
    nodeOne = document.createElement('div');
    nodeOne.id = 'Node1';
    nodeOne.className = 'node';

    nodeTwo = document.createElement('div');
    nodeTwo.id = 'Node2';
    nodeTwo.className = 'node';

    document.body.appendChild(nodeOne);
    document.body.appendChild(nodeTwo);
  });

  afterEach(() => {
    nodeOne.parentNode.removeChild(nodeOne);
    nodeTwo.parentNode.removeChild(nodeTwo);
  });

  it('returns a ContainerQuery for a single node', () => {
    expect(containerQuery(nodeOne)).to.be.an.instanceOf(ContainerQuery);
  });

  it('returns a MultipleNodeContainerQuery for an array of nodes', () => {
    let containerQueries = containerQuery([nodeOne, nodeTwo]);
    expect(containerQueries).to.be.an.instanceOf(MultipleNodeContainerQuery);
    expect(containerQueries.containerQueries).to.have.length(2);
  });

  it('returns a MultipleNodeContainerQuery for a NodeList', () => {
    let containerQueries = containerQuery(document.querySelectorAll('.node'));
    expect(containerQueries).to.be.an.instanceOf(MultipleNodeContainerQuery);
    expect(containerQueries.containerQueries).to.have.length(2);
  });

  it('returns a MultipleNodeContainerQuery for a string selector', () => {
    let containerQueries = containerQuery('.node');
    expect(containerQueries).to.be.an.instanceOf(MultipleNodeContainerQuery);
    expect(containerQueries.containerQueries).to.have.length(2);
  });
});
