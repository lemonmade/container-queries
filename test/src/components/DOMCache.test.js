import '../../helper';

import DOMCache from '../../../src/components/DOMCache';

describe('DOMCache', () => {
  const key = 'foo';
  const value = 200;
  let node;

  beforeEach(() => {
    node = document.createElement('div');
  });

  describe('#getValueForNode()', () => {
    it('returns nothing when no data has been set', () => {
      expect(DOMCache.getValueForNode(node, {key})).to.be.undefined;
    });

    it('returns a set value', () => {
      DOMCache.setValueForNode(node, {key, value});
      expect(DOMCache.getValueForNode(node, {key})).to.equal(value);
    });
  });

  describe('#setValueForNode()', () => {
    it('overwrites a set value', () => {
      DOMCache.setValueForNode(node, {key, value});
      expect(DOMCache.getValueForNode(node, {key})).to.equal(value);

      DOMCache.setValueForNode(node, {key, value: value * 2});
      expect(DOMCache.getValueForNode(node, {key})).to.equal(value * 2);
    });
  });

  describe('#deleteValueForNode', () => {
    it('removes a set value', () => {
      DOMCache.setValueForNode(node, {key, value});
      DOMCache.deleteValueForNode(node, {key});
      expect(DOMCache.getValueForNode(node, {key})).to.be.undefined;
    });

    it('does not choke on a value-less node', () => {
      expect(() => DOMCache.deleteValueForNode(node, {key})).not.to.throw(Error);
    });
  });

  describe('#clearForNode()', () => {
    it('does not throw when clearing a node without data', () => {
      expect(() => DOMCache.clearForNode(node)).not.to.throw(Error);
    });

    it('clears a set value', () => {
      DOMCache.setValueForNode(node, {key, value});
      DOMCache.clearForNode(node);
      expect(DOMCache.getValueForNode(node, {key})).to.be.undefined;
    });
  });
});
