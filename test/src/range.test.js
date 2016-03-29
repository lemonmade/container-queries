import 'test-helper';
import {Inclusivity, identifierForMinMax, effectiveMinMax, minMaxInclusiveFromIdentifier} from 'range';

describe('range utilities', () => {
  describe('Inclusivity', () => {
    it('identifies full inclusivity', () => {
      const inclusivity = new Inclusivity(true);

      expect(inclusivity.min).to.be.true;
      expect(inclusivity.max).to.be.true;
      expect(inclusivity.both).to.be.true;
      expect(inclusivity.neither).to.be.false;
      expect(inclusivity.value).to.be.true;
    });

    it('identifies min inclusivity', () => {
      const inclusivity = new Inclusivity('min');

      expect(inclusivity.min).to.be.true;
      expect(inclusivity.max).to.be.false;
      expect(inclusivity.both).to.be.false;
      expect(inclusivity.neither).to.be.false;
      expect(inclusivity.value).to.equal('min');
    });

    it('identifies max inclusivity', () => {
      const inclusivity = new Inclusivity('max');

      expect(inclusivity.min).to.be.false;
      expect(inclusivity.max).to.be.true;
      expect(inclusivity.both).to.be.false;
      expect(inclusivity.neither).to.be.false;
      expect(inclusivity.value).to.equal('max');
    });

    it('identifies full exclusivity', () => {
      const inclusivity = new Inclusivity(false);

      expect(inclusivity.min).to.be.false;
      expect(inclusivity.max).to.be.false;
      expect(inclusivity.both).to.be.false;
      expect(inclusivity.neither).to.be.true;
      expect(inclusivity.value).to.be.false;
    });
  });

  describe('parsing and stringifying', () => {
    const min = 500;
    const max = 1000;

    function testAllValuesForMinMaxInclusivity(theMin, theMax, inclusivity, expectedIdentifier) {
      expect(identifierForMinMax(theMin, theMax, {withInclusivity: inclusivity})).to.equal(expectedIdentifier);

      const {min: parsedMin, max: parsedMax, inclusive} = minMaxInclusiveFromIdentifier(expectedIdentifier);
      const {min: effectiveMin, max: effectiveMax} = effectiveMinMax(theMin, theMax, {withInclusivity: inclusivity});

      if (theMin == null) {
        expect(parsedMin).to.be.undefined;
        expect(effectiveMin).to.be.undefined;
      } else {
        expect(parsedMin).to.equal(theMin);
        expect(effectiveMin).to.equal(inclusivity.min ? theMin : theMin + 1);
      }

      if (theMax == null) {
        expect(parsedMax).to.be.undefined;
        expect(effectiveMax).to.be.undefined;
      } else {
        expect(parsedMax).to.equal(theMax);
        expect(effectiveMax).to.equal(inclusivity.max ? theMax : theMax - 1);
      }

      expect(inclusive).to.equal(inclusivity.value);
    }

    it('handles a min and no max', () => {
      testAllValuesForMinMaxInclusivity(min, null, new Inclusivity(true), `>=${min}`);
      testAllValuesForMinMaxInclusivity(min, null, new Inclusivity(false), `>${min}`);
    });

    it('handles a max and no min', () => {
      testAllValuesForMinMaxInclusivity(null, max, new Inclusivity(true), `<=${max}`);
      testAllValuesForMinMaxInclusivity(null, max, new Inclusivity(false), `<${max}`);
    });

    it('handles a min and max', () => {
      testAllValuesForMinMaxInclusivity(min, max, new Inclusivity(true), `${min}...${max}`);
      testAllValuesForMinMaxInclusivity(min, max, new Inclusivity(false), `${min}>..<${max}`);
      testAllValuesForMinMaxInclusivity(min, max, new Inclusivity('min'), `${min}..<${max}`);
      testAllValuesForMinMaxInclusivity(min, max, new Inclusivity('max'), `${min}>..${max}`);
    });

    it('handles zeros', () => {
      testAllValuesForMinMaxInclusivity(0, 0, new Inclusivity(true), '0...0');
    });

    it('handles no min and no max', () => {
      expect(identifierForMinMax(null, null)).to.be.null;
    });
  });
});
