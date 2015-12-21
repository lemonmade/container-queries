import '../helper';

import {ContainerQuery, MultipleNodeContainerQuery} from '../../src/ContainerQuery';

describe('ContainerQuery', () => {
  const cutoff = 500;
  let objectStub;
  let node;
  let cq;

  beforeEach(() => {
    node = document.createElement('div');
    node.appendChild(document.createElement('div'));
    document.body.appendChild(node);

    objectStub = {
      setAttribute(attr, value) { this[attr] = value; },
      style: {},
      contentDocument: {
        defaultView: {
          addEventListener: sinon.spy(),
        },
        body: {clientWidth: 0},
      },
    };

    sinon.stub(document, 'createElement').returns(objectStub);
    sinon.stub(window.Node.prototype, 'appendChild');

    cq = new ContainerQuery(node);
  });

  afterEach(() => {
    document.createElement.restore();
    window.Node.prototype.appendChild.restore();
  });

  describe('resize listener', () => {
    it('does not append an object until a query is added', () => {
      expect(node.parentNode.appendChild).not.to.have.been.called;

      cq.addQuery({min: cutoff});
      expect(node.parentNode.appendChild).to.have.been.calledWith(objectStub);
    });

    it('does not append an object if the node has no parent node', () => {
      node.parentNode.removeChild(node);
      cq.addQuery({min: cutoff});

      expect(document.createElement).not.to.have.been.called;
    });

    it('only appends a single object', () => {
      cq.addQuery({min: cutoff});
      cq.addQuery({max: cutoff * 2});

      expect(node.parentNode.appendChild).to.have.been.calledOnce;
    });

    it('appends an out-of-document-flow object to the root node', () => {
      cq.addQuery({min: cutoff});

      let expectedStyle = {
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        'pointer-events': 'none',
        'z-index': -1,
      };

      expect(objectStub).to.have.property('tabindex', -1);
      expect(objectStub).to.have.property('data', 'about:blank');

      let style = objectStub.style.cssText;
      Object.keys(expectedStyle).forEach((property) => {
        expect(style).to.include(`${property}: ${expectedStyle[property]}`);
      });
    });

    it('updates the parent to be relatively positioned', () => {
      node.parentNode.style.position = 'static';
      cq.addQuery({min: cutoff});
      expect(node.parentNode.style.position).to.equal('relative');
    });

    ['relative', 'absolute', 'fixed'].forEach((positioning) => {
      it(`does not update '${positioning}' positioning of the parent`, () => {
        node.parentNode.style.position = positioning;
        cq.addQuery({min: cutoff});
        expect(node.parentNode.style.position).to.equal(positioning);
      });
    });

    it('calls #update() on load and attaches a listener for resizes', () => {
      sinon.stub(cq, 'update');

      cq.addQuery({min: cutoff});
      expect(cq.update).not.to.have.been.called;

      objectStub.onload({target: objectStub});
      expect(cq.update).to.have.been.called;

      let addEventListenerArgs = objectStub.contentDocument.defaultView.addEventListener.firstCall.args;
      addEventListenerArgs[1]();
      expect(addEventListenerArgs[0]).to.equal('resize');
      expect(cq.update).to.have.been.calledTwice;
    });
  });

  describe('#update()', () => {
    let query;

    function simulateWidth(width) {
      objectStub.contentDocument.body.clientWidth = width;
      cq.update();
    }

    beforeEach(() => {
      query = cq.addQuery({min: cutoff});
      objectStub.contentDocument.body.clientWidth = cutoff + 1;
    });

    it('adds an attribute with matching queries', () => {
      simulateWidth(cutoff + 1);
      expect(node.getAttribute('data-matching-queries')).to.equal(query.identifier);
    });

    it('does not add an attribute for non-matching queries', () => {
      simulateWidth(cutoff - 1);
      expect(node.getAttribute('data-matching-queries')).to.be.empty;
    });

    it('removes the attribute for a formerly matching query', () => {
      simulateWidth(cutoff + 1);
      simulateWidth(cutoff - 1);
      expect(node.getAttribute('data-matching-queries')).to.be.empty;
    });

    it('includes multiple matching queries as a space-separated list', () => {
      let queryTwo = cq.addQuery({min: cutoff - 1});
      simulateWidth(cutoff + 1);
      expect(node.getAttribute('data-matching-queries')).to.equal(`${query.identifier} ${queryTwo.identifier}`);
    });
  });
});

describe('MultipleNodeContainerQuery', () => {
  let nodeOne;
  let nodeTwo;

  function spyOnContainerQueries(cqContainer, method) {
    cqContainer.containerQueries.forEach((cq) => sinon.stub(cq, method));
  }

  beforeEach(() => {
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
    let cq = new MultipleNodeContainerQuery([nodeOne, nodeTwo]);
    expect(cq.containerQueries[0].node).to.deep.equal(nodeOne);
    expect(cq.containerQueries[1].node).to.deep.equal(nodeTwo);

    cq = new MultipleNodeContainerQuery(document.querySelectorAll('.node'));
    expect(cq.containerQueries[0].node).to.deep.equal(nodeOne);
    expect(cq.containerQueries[1].node).to.deep.equal(nodeTwo);
  });

  describe('#update()', () => {
    let cqContainer = new MultipleNodeContainerQuery([nodeOne, nodeTwo]);
    spyOnContainerQueries(cqContainer, 'update');
    cqContainer.update();

    cqContainer.containerQueries.forEach((cq) => {
      expect(cq.update).to.have.been.called;
    });
  });

  describe('#addQuery()', () => {
    let cqContainer = new MultipleNodeContainerQuery([nodeOne, nodeTwo]);
    let addQueryArg = {min: 500};
    spyOnContainerQueries(cqContainer, 'addQuery');
    cqContainer.addQuery(addQueryArg);

    cqContainer.containerQueries.forEach((cq) => {
      expect(cq.addQuery).to.have.been.calledWith(addQueryArg);
    });
  });
});
