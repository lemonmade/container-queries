import '../../helper';

import ContainerQuery from '../../../src/components/ContainerQuery';
import {Inclusivity} from '../../../src/range';

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
      const minCutoff = cutoff;
      const maxCutoff = cutoff * 2;
      const name = 'myQuery_strange-name_33';

      function setNodeDataAttribute(value) {
        node.setAttribute(`data-container-queries`, `${name}: ${value}`);
        cq = new ContainerQuery(node, [], {resizeDetectorCreator: resizeDetectorStubFactory});
      }

      function testWidthsAroundCutoff({min = false, max = false, inclusive = true}) {
        let inclusivity = new Inclusivity(inclusive);

        if (min) {
          resizeDetectorStub.width = minCutoff - 1;
          cq.update();
          expect(node.getAttribute('data-matching-queries')).to.equal('');

          resizeDetectorStub.width = minCutoff;
          cq.update();
          expect(node.getAttribute('data-matching-queries')).to.equal(inclusivity.min ? name : '');

          resizeDetectorStub.width = minCutoff + 1;
          cq.update();
          expect(node.getAttribute('data-matching-queries')).to.equal(name);
        }

        if (max) {
          resizeDetectorStub.width = maxCutoff - 1;
          cq.update();
          expect(node.getAttribute('data-matching-queries')).to.equal(name);

          resizeDetectorStub.width = maxCutoff;
          cq.update();
          expect(node.getAttribute('data-matching-queries')).to.equal(inclusivity.max ? name : '');

          resizeDetectorStub.width = maxCutoff + 1;
          cq.update();
          expect(node.getAttribute('data-matching-queries')).to.equal('');
        }
      }

      it('attaches named data queries with a "X" as an inclusive minimum width', () => {
        setNodeDataAttribute(minCutoff);
        testWidthsAroundCutoff({min: true, inclusive: true});
      });

      it('attaches named data queries with a "Xpx" as an inclusive minimum width', () => {
        setNodeDataAttribute(`${minCutoff}px`);
        testWidthsAroundCutoff({min: true, inclusive: true});
      });

      it('attaches named data queries with a ">=X" as an inclusive minimum width', () => {
        setNodeDataAttribute(`>=${minCutoff}`);
        testWidthsAroundCutoff({min: true, inclusive: true});
      });

      it('attaches named data queries with a ">=Xpx" as an inclusive minimum width', () => {
        setNodeDataAttribute(`>=${minCutoff}px`);
        testWidthsAroundCutoff({min: true, inclusive: true});
      });

      it('attaches named data queries with a ">X" as an exclusive minimum width', () => {
        setNodeDataAttribute(`>${minCutoff}`);
        testWidthsAroundCutoff({min: true, inclusive: false});
      });

      it('attaches named data queries with a ">Xpx" as an exclusive minimum width', () => {
        setNodeDataAttribute(`>${minCutoff}px`);
        testWidthsAroundCutoff({min: true, inclusive: false});
      });

      it('attaches named data queries with a "<=X" as an inclusive maximum width', () => {
        setNodeDataAttribute(`<=${maxCutoff}`);
        testWidthsAroundCutoff({max: true, inclusive: true});
      });

      it('attaches named data queries with a "<=Xpx" as an inclusive maximum width', () => {
        setNodeDataAttribute(`<=${maxCutoff}px`);
        testWidthsAroundCutoff({max: true, inclusive: true});
      });

      it('attaches named data queries with a "<X" as an exclusive maximum width', () => {
        setNodeDataAttribute(`<${maxCutoff}`);
        testWidthsAroundCutoff({max: true, inclusive: false});
      });

      it('attaches named data queries with a "<Xpx" as an exclusive maximum width', () => {
        setNodeDataAttribute(`<${maxCutoff}px`);
        testWidthsAroundCutoff({max: true, inclusive: false});
      });

      it('attaches named data queries with a "X...Y" as an inclusive minimum and maximum width', () => {
        setNodeDataAttribute(`${minCutoff}...${maxCutoff}`);
        testWidthsAroundCutoff({min: true, max: true, inclusive: true});
      });

      it('attaches named data queries with a "Xpx...Ypx" as an inclusive minimum and maximum width', () => {
        setNodeDataAttribute(`${minCutoff}px...${maxCutoff}px`);
        testWidthsAroundCutoff({min: true, max: true, inclusive: true});
      });

      it('attaches named data queries with a "X>..Y" as an exclusive minimum and inclusive maximum width', () => {
        setNodeDataAttribute(`${minCutoff}>..${maxCutoff}`);
        testWidthsAroundCutoff({min: true, max: true, inclusive: 'max'});
      });

      it('attaches named data queries with a "Xpx>..Ypx" as an exclusive minimum and inclusive maximum width', () => {
        setNodeDataAttribute(`${minCutoff}px>..${maxCutoff}px`);
        testWidthsAroundCutoff({min: true, max: true, inclusive: 'max'});
      });

      it('attaches named data queries with a "X...<Y" as an inclusive minimum and exclusive maximum width', () => {
        setNodeDataAttribute(`${minCutoff}..<${maxCutoff}`);
        testWidthsAroundCutoff({min: true, max: true, inclusive: 'min'});
      });

      it('attaches named data queries with a "Xpx..<Ypx" as an inclusive minimum and exclusive maximum width', () => {
        setNodeDataAttribute(`${minCutoff}px..<${maxCutoff}px`);
        testWidthsAroundCutoff({min: true, max: true, inclusive: 'min'});
      });

      it('attaches named data queries with a "X>..<Y" as an exclusive minimum and maximum width', () => {
        setNodeDataAttribute(`${minCutoff}>..<${maxCutoff}`);
        testWidthsAroundCutoff({min: true, max: true, inclusive: false});
      });

      it('attaches named data queries with a "Xpx>..<Ypx" as an exclusive minimum and maximum width', () => {
        setNodeDataAttribute(`${minCutoff}px>..<${maxCutoff}px`);
        testWidthsAroundCutoff({min: true, max: true, inclusive: false});
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
