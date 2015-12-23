import {Inclusivity, identifierForMinMax, effectiveMinMax} from '../range';

let queryIndex = 1;

export default class Query {
  constructor({test, identifier, min, max, inclusive} = {}) {
    let inclusivity = new Inclusivity(inclusive);
    let {min: adjustedMin, max: adjustedMax} = effectiveMinMax(min, max, {withInclusivity: inclusivity});

    this.identifier = identifier || identifierForMinMax(min, max, {withInclusivity: inclusivity}) || `ContainerQuery${queryIndex++}`;
    this.matches = false;
    this._listeners = [];

    if (test != null) {
      this.test = test;
    } else {
      this.test = createConditionFromMinMax(adjustedMin, adjustedMax);
    }
  }

  onChange(listener) {
    this._listeners.push(listener);
  }

  update(width) {
    let lastMatches = this.matches;
    this.matches = this.test(width);

    if (this.matches !== lastMatches) {
      for (let listener of this._listeners) { listener(this); }
    }

    return this.matches;
  }
}

function createConditionFromMinMax(min = 0, max = 100000) {
  return (width) => width >= min && width <= max;
}
