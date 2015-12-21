import '../helper';

import Query from '../../src/Query';

describe('Query', () => {
  describe('#identifier', () => {
    it('uses a supplied identifier', () => {
      let identifier = 'foo-query';
      let query = new Query({identifier});

      expect(query.identifier).to.equal(identifier);
    });

    it('creates an identifier from a min value', () => {
      let min = 500;
      let query = new Query({min});
      expect(query.identifier).to.equal(`>=${min}`);
    });

    it('creates an identifier from a max value', () => {
      let max = 500;
      let query = new Query({max});
      expect(query.identifier).to.equal(`<=${max}`);
    });

    it('creates an identifier from a min and max value', () => {
      let min = 500;
      let max = 1000;
      let query = new Query({min, max});
      expect(query.identifier).to.equal(`${min}-${max}`);
    });

    it('uses a unique identifier for queries without min/ max/ identifier', () => {
      let queryOne = new Query();
      let queryTwo = new Query({test() {}});

      expect(queryOne.identifier).to.be.a('string');
      expect(queryTwo.identifier).to.be.a('string');
      expect(queryOne.identifier).not.to.equal(queryTwo.identifier);
    });
  });

  describe('#test()', () => {
    const minCutoff = 500;
    const maxCutoff = 1000;

    it('uses the passed test parameter', () => {
      let test = sinon.spy(() => 'foo');
      let query = new Query({test});
      let result = query.test(minCutoff);

      expect(test).to.have.been.called;
      expect(result).to.equal('foo');
    });

    it('uses a passed minimum', () => {
      let query = new Query({min: minCutoff});

      expect(query.test(minCutoff)).to.be.true;
      expect(query.test(minCutoff + 1)).to.be.true;
      expect(query.test(minCutoff - 1)).to.be.false;
      expect(query.test(maxCutoff + 1)).to.be.true;
    });

    it('uses a passed maximum', () => {
      let query = new Query({max: maxCutoff});

      expect(query.test(maxCutoff)).to.be.true;
      expect(query.test(maxCutoff - 1)).to.be.true;
      expect(query.test(maxCutoff + 1)).to.be.false;
      expect(query.test(minCutoff - 1)).to.be.true;
    });

    it('uses a minimum and maximum', () => {
      let query = new Query({min: minCutoff, max: maxCutoff});

      expect(query.test(minCutoff)).to.be.true;
      expect(query.test(minCutoff + 1)).to.be.true;
      expect(query.test(minCutoff - 1)).to.be.false;

      expect(query.test(maxCutoff)).to.be.true;
      expect(query.test(maxCutoff - 1)).to.be.true;
      expect(query.test(maxCutoff + 1)).to.be.false;
    });
  });

  describe('#update()', () => {
    const cutoff = 500;
    let query;
    let listener;

    beforeEach(() => {
      query = new Query({min: cutoff});
      listener = sinon.spy();
      query.onChange(listener);
    });

    it('updates the #matches property and returns the new value', () => {
      expect(query.matches).to.be.false;

      let update = query.update(cutoff + 1);
      expect(update).to.be.true;
      expect(query.matches).to.be.true;

      update = query.update(cutoff - 1);
      expect(update).to.be.false;
      expect(query.matches).to.be.false;
    });

    it('calls a registered listener with the query', () => {
      query.update(cutoff + 1);
      expect(listener).to.have.been.calledWith(query);
    });

    it('only calls a listener when the matching status changes', () => {
      query.update(cutoff - 1);
      expect(listener).not.to.have.been.called;

      query.update(cutoff + 1);
      query.update(cutoff + 2);
      expect(listener).to.have.been.called.once;
    });
  });
});
