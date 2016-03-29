export class Inclusivity {
  constructor(inclusive = true) {
    this.min = (inclusive === true) || (inclusive === 'min');
    this.max = (inclusive === true) || (inclusive === 'max');
  }

  get both() { return this.min && this.max; }
  get neither() { return !this.min && !this.max; }
  get value() { return this.both ? true : ((this.min && 'min') || (this.max && 'max') || false); }
}

export function identifierForMinMax(min, max, {withInclusivity: inclusivity} = {}) {
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
  const result = {};
  const inclusivity = new Inclusivity();

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

  if (result.max == null) { inclusivity.max = inclusivity.min; }
  if (result.min == null) { inclusivity.min = inclusivity.max; }

  result.inclusive = inclusivity.value;

  return result;
}

function interiorForInclusivity(inclusivity) {
  return `${inclusivity.min ? '.' : '>'}${inclusivity.neither ? '..' : '.'}${inclusivity.max ? '.' : '<'}`;
}

export function effectiveMinMax(min, max, {withInclusivity: inclusivity}) {
  const result = {};
  if (min != null) { result.min = inclusivity.min ? min : min + 1; }
  if (max != null) { result.max = inclusivity.max ? max : max - 1; }
  return result;
}
