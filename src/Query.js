export default class Query {
  constructor({min, max, test, identifier} = {}) {
    this.identifier = identifier || identifierForMinMax(min, max);
    this.matches = false;
    this._listeners = [];

    if (test != null) {
      this.test = test;
    } else {
      this.test = createConditionFromMinMax(min, max);
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

let queryIndex = 1;

function identifierForMinMax(min, max) {
  if (min != null && max != null) {
    return `${min}-${max}`;
  } else if (min != null) {
    return `>=${min}`;
  } else if (max != null) {
    return `<=${max}`;
  } else {
    return `ContainerQuery${queryIndex++}`;
  }
}

function createConditionFromMinMax(min = 0, max = 100000) {
  return (width) => width >= min && width <= max;
}
