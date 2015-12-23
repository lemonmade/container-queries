import '../helper';

import ContainerQuery from '../../src/ContainerQuery';

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

    cq = new ContainerQuery(node, [], {resizeDetectorCreator: resizeDetectorStubFactory});
  });

  afterEach(() => {
    cq.destroy();
    document.body.removeChild(node);
  });

  describe('#constructor()', () => {
    it('adds itself as a listener on the resize detector', () => {
      expect(resizeDetectorStub.addListener).to.have.been.calledWith(cq.update);
    });

    it('allows passing an initial set of queries', () => {
      cq = new ContainerQuery(node, [{min: cutoff}], {resizeDetectorCreator: resizeDetectorStubFactory});

      resizeDetectorStub.width = cutoff + 1;
      cq.update();

      expect(cq.queries.length).to.equal(1);
      expect(node.getAttribute('data-matching-queries')).to.equal(cq.queries[0].identifier);
    });

    describe('data queries', () => {
      const name = 'myquery';

      function setNodeDataAttribute(value) {
        node.setAttribute(`data-container-query-${name}`, value);
        cq = new ContainerQuery(node, [], {resizeDetectorCreator: resizeDetectorStubFactory});
      }

      function testWidthsAroundCutoff({min}) {
        resizeDetectorStub.width = cutoff + 1;
        cq.update();
        expect(node.getAttribute('data-matching-queries')).to.equal(min ? name : '');

        resizeDetectorStub.width = cutoff - 1;
        cq.update();
        expect(node.getAttribute('data-matching-queries')).to.be.equal(min ? '' : name);
      }

      it('attaches named data queries with a "X" as a minimum width', () => {
        setNodeDataAttribute(cutoff);
        testWidthsAroundCutoff({min: true});
      });

      it('attaches named data queries with a "Xpx" as a minimum width', () => {
        setNodeDataAttribute(`${cutoff}px`);
        testWidthsAroundCutoff({min: true});
      });

      it('attaches named data queries with a ">X" as a minimum width', () => {
        setNodeDataAttribute(`>${cutoff}`);
        testWidthsAroundCutoff({min: true});
      });

      it('attaches named data queries with a ">Xpx" as a minimum width', () => {
        setNodeDataAttribute(`>${cutoff}px`);
        testWidthsAroundCutoff({min: true});
      });

      it('attaches named data queries with a "<X" as a maximum width', () => {
        setNodeDataAttribute(`<${cutoff}`);
        testWidthsAroundCutoff({min: false});
      });

      it('attaches named data queries with a "<Xpx" as a maximum width', () => {
        setNodeDataAttribute(`<${cutoff}px`);
        testWidthsAroundCutoff({min: false});
      });
    });
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

  describe('#addQuery()', () => {
    beforeEach(() => {
      resizeDetectorStub.width = 555;
    });

    it('immediately evaluates the new query', () => {
      let query = cq.addQuery({test: sinon.stub().returns(true)});
      expect(query.test).to.have.been.calledWith(resizeDetectorStub.width);
      expect(node.getAttribute('data-matching-queries')).to.equal(query.identifier);
    });
  });

  describe('#addQueries', () => {
    it('adds all queries and runs them once immediately', () => {
      let queries = cq.addQueries([
        {test: sinon.stub().returns(true)},
        {test: sinon.stub().returns(true)},
      ]);

      queries.forEach((query) => {
        expect(query.test).to.have.been.calledOnce;
        expect(query.test).to.have.been.calledWith(resizeDetectorStub.width);
      });

      expect(node.getAttribute('data-matching-queries')).to.equal(
        queries.map((query) => query.identifier).join(' ')
      );
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
