import '../../helper';

import MultipleNodeContainerQuery from '../../../src/components/MultipleNodeContainerQuery';

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
    let cq = new MultipleNodeContainerQuery([nodeOne, nodeTwo], [], {resizeDetectorCreator: resizeDetectorStubFactory});
    expect(cq.containerQueries[0].node).to.deep.equal(nodeOne);
    expect(cq.containerQueries[1].node).to.deep.equal(nodeTwo);

    cq = new MultipleNodeContainerQuery(document.querySelectorAll('.node'), [], {resizeDetectorCreator: resizeDetectorStubFactory});
    expect(cq.containerQueries[0].node).to.deep.equal(nodeOne);
    expect(cq.containerQueries[1].node).to.deep.equal(nodeTwo);
  });

  describe('#update()', () => {
    it('calls the method in each container query', () => {
      let cqContainer = new MultipleNodeContainerQuery([nodeOne, nodeTwo], [], {resizeDetectorCreator: resizeDetectorStubFactory});
      spyOnContainerQueries(cqContainer, 'update');
      cqContainer.update();

      cqContainer.containerQueries.forEach((cq) => {
        expect(cq.update).to.have.been.called;
      });
    });
  });

  describe('#addQuery()', () => {
    it('calls the method in each container query', () => {
      let cqContainer = new MultipleNodeContainerQuery([nodeOne, nodeTwo], [], {resizeDetectorCreator: resizeDetectorStubFactory});
      let addQueryArg = {min: 500};
      spyOnContainerQueries(cqContainer, 'addQuery');
      cqContainer.addQuery(addQueryArg);

      cqContainer.containerQueries.forEach((cq) => {
        expect(cq.addQuery).to.have.been.calledWith(addQueryArg);
      });
    });
  });

  describe('#destroy()', () => {
    it('calls the method in each container query', () => {
      let cqContainer = new MultipleNodeContainerQuery([nodeOne, nodeTwo], [], {resizeDetectorCreator: resizeDetectorStubFactory});
      spyOnContainerQueries(cqContainer, 'destroy');
      cqContainer.destroy();

      cqContainer.containerQueries.forEach((cq) => {
        expect(cq.destroy).to.have.been.called;
      });
    });
  });
});
