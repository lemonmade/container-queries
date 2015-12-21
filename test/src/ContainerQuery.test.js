import '../helper';

import {ContainerQuery, MultipleNodeContainerQuery} from '../../src/ContainerQuery';

describe('ContainerQuery', () => {
  const cutoff = 500;
  let node;
  let cq;
  let resizeDetectorStub;
  let resizeDetectorStubFactory;

  beforeEach(() => {
    node = document.createElement('div');
    document.body.appendChild(node);

    resizeDetectorStub = {
      addListener: sinon.spy(),
      removeListener: sinon.spy(),
    };

    resizeDetectorStubFactory = sinon.stub().returns(resizeDetectorStub);

    cq = new ContainerQuery(node, resizeDetectorStubFactory);
  });

  afterEach(() => {
    // cq.destroy();
    document.body.removeChild(node);
  });

  it('adds itself as a listener on the resize detector', () => {
    expect(resizeDetectorStub.addListener).to.have.been.calledWith(cq.update);
  });

  describe('#update()', () => {
    let query;

    beforeEach(() => {
      query = cq.addQuery({min: cutoff});
    });

    it('uses the resize detector width if none is provided', () => {
      resizeDetectorStub.width = cutoff + 1;
      cq.update();
      expect(node.getAttribute('data-matching-queries')).to.equal(query.identifier);
    });

    it('adds an attribute with matching queries', () => {
      cq.update(cutoff + 1);
      expect(node.getAttribute('data-matching-queries')).to.equal(query.identifier);
    });

    it('does not add an attribute for non-matching queries', () => {
      cq.update(cutoff - 1);
      expect(node.getAttribute('data-matching-queries')).to.be.empty;
    });

    it('removes the attribute for a formerly matching query', () => {
      cq.update(cutoff + 1);
      cq.update(cutoff - 1);
      expect(node.getAttribute('data-matching-queries')).to.be.empty;
    });

    it('includes multiple matching queries as a space-separated list', () => {
      let queryTwo = cq.addQuery({min: cutoff - 1});
      cq.update(cutoff + 1);
      expect(node.getAttribute('data-matching-queries')).to.equal(`${query.identifier} ${queryTwo.identifier}`);
    });
  });

  describe('#destroy()', () => {
    it('clears out all references', () => {
      cq.destroy();
      expect(cq.node).to.be.undefined;
      expect(cq.queries).to.be.empty;
      expect(resizeDetectorStub.removeListener).to.have.been.calledWith(cq.update);
    });
  });
});

describe('MultipleNodeContainerQuery', () => {
  let nodeOne;
  let nodeTwo;
  let resizeDetectorStubFactory;

  function spyOnContainerQueries(cqContainer, method) {
    cqContainer.containerQueries.forEach((cq) => sinon.stub(cq, method));
  }

  beforeEach(() => {
    resizeDetectorStubFactory = sinon.stub().returns({
      addListener() {},
      removeListener() {},
    });

    nodeOne = document.createElement('div');
    nodeOne.className = 'node';
    nodeTwo = nodeOne.cloneNode(false);

    document.body.appendChild(nodeOne);
    document.body.appendChild(nodeTwo);
  });

  afterEach(() => {
    nodeOne.parentNode.removeChild(nodeOne);
    nodeTwo.parentNode.removeChild(nodeTwo);
  });

  it('creates a ContainerQuery for each node', () => {
    let cq = new MultipleNodeContainerQuery([nodeOne, nodeTwo], resizeDetectorStubFactory);
    expect(cq.containerQueries[0].node).to.deep.equal(nodeOne);
    expect(cq.containerQueries[1].node).to.deep.equal(nodeTwo);

    cq = new MultipleNodeContainerQuery(document.querySelectorAll('.node'), resizeDetectorStubFactory);
    expect(cq.containerQueries[0].node).to.deep.equal(nodeOne);
    expect(cq.containerQueries[1].node).to.deep.equal(nodeTwo);
  });

  describe('#update()', () => {
    let cqContainer = new MultipleNodeContainerQuery([nodeOne, nodeTwo], resizeDetectorStubFactory);
    spyOnContainerQueries(cqContainer, 'update');
    cqContainer.update();

    cqContainer.containerQueries.forEach((cq) => {
      expect(cq.update).to.have.been.called;
    });
  });

  describe('#addQuery()', () => {
    let cqContainer = new MultipleNodeContainerQuery([nodeOne, nodeTwo], resizeDetectorStubFactory);
    let addQueryArg = {min: 500};
    spyOnContainerQueries(cqContainer, 'addQuery');
    cqContainer.addQuery(addQueryArg);

    cqContainer.containerQueries.forEach((cq) => {
      expect(cq.addQuery).to.have.been.calledWith(addQueryArg);
    });
  });

  describe('#destroy()', () => {
    let cqContainer = new MultipleNodeContainerQuery([nodeOne, nodeTwo], resizeDetectorStubFactory);
    spyOnContainerQueries(cqContainer, 'destroy');
    cqContainer.destroy();

    cqContainer.containerQueries.forEach((cq) => {
      expect(cq.destroy).to.have.been.called;
    });
  });
});
