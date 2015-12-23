export class Inclusivity {
  constructor(inclusive = true) {
    this.min = (inclusive === true) || (inclusive === 'min');
    this.max = (inclusive === true) || (inclusive === 'max');
  }

  get both() { return this.min && this.max; }
  get neither() { return !this.min && !this.max; }
  get value() { return this.both ? true : ((this.min && 'min') || (this.max && 'max') || false); }
}

export function identifierForMinMax(min, max, {withInclusivity: inclusivity}) {
  if (min != null && max != null) {
    return `${min}${interiorForInclusivity(inclusivity)}${max}`;
  } else if (min != null) {
    return `${inclusivity.min ? '>=' : '>'}${min}`;
  } else if (max != null) {
    return `${inclusivity.max ? '<=' : '<'}${max}`;
  } else {
    return null;
  }
}

const maxRegex = /([<\.]=?)(\d+)/;
const maxInclusiveRegex = /(<=|\.)/;
const minRegex = /(>?=?)(\d+)[^\.>]*(>?)/;

export function minMaxInclusiveFromIdentifier(identifier) {
  let result = {};
  let inclusivity = new Inclusivity();

  identifier
    .replace(maxRegex, (match, condition, number) => {
      inclusivity.max = maxInclusiveRegex.test(condition);
      result.max = parseInt(number, 10);
      return '';
    })
    .replace(minRegex, (match, beforeCondition, number, afterCondition) => {
      inclusivity.min = (beforeCondition === '>=') || ((beforeCondition === '') && (afterCondition !== '>'));
      result.min = parseInt(number, 10);
      return '';
    });

  result.inclusive = inclusivity.value;

  return result;
}

function interiorForInclusivity(inclusivity) {
  return `${inclusivity.min ? '.' : '>'}${inclusivity.neither ? '..' : '.'}${inclusivity.max ? '.' : '<'}`;
}

export function effectiveMinMax(min, max, {withInclusivity: inclusivity}) {
  return {
    min: (inclusivity.min || min == null) ? min : min + 1,
    max: (inclusivity.max || max == null) ? max : max - 1,
  };
}
