export default class Query {
  constructor({test, identifier, min, max, inclusive} = {}) {
    let inclusivity = determineInclusivity(inclusive);
    let {min: adjustedMin, max: adjustedMax} = adjustedMinMax(min, max, inclusivity);
    this.identifier = identifier || identifierForMinMax(min, max, inclusivity);
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

function determineInclusivity(inclusive = true) {
  let min = (inclusive === true) || (inclusive === 'min');
  let max = (inclusive === true) || (inclusive === 'max');

  return {min, max, both: (min && max), neither: (!min && !max)};
}

let queryIndex = 1;

function identifierForMinMax(min, max, inclusivity) {
  if (min != null && max != null) {
    return `${min}${interiorForMinMaxInclusivity(inclusivity)}${max}`;
  } else if (min != null) {
    return `${inclusivity.min ? '>=' : '>'}${min}`;
  } else if (max != null) {
    return `${inclusivity.max ? '<=' : '<'}${max}`;
  } else {
    return `ContainerQuery${queryIndex++}`;
  }
}

function interiorForMinMaxInclusivity(inclusivity) {
  return `${inclusivity.min ? '.' : '>'}${inclusivity.neither ? '..' : '.'}${inclusivity.max ? '.' : '<'}`;
}

function adjustedMinMax(min, max, inclusivity) {
  return {
    min: (inclusivity.min || min == null) ? min : min + 1,
    max: (inclusivity.max || max == null) ? max : max - 1,
  };
}

function createConditionFromMinMax(min = 0, max = 100000) {
  return (width) => width >= min && width <= max;
}
