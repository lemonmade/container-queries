# ContainerQueries

A set of utilities for creating simple, width-based container queries.

[![Build status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Maintained][maintained-image]][maintained-url] [![NPM version][npm-image]][npm-url] [![Dependency Status][dependency-image]][dependency-url] [![Dev Dependency Status][devDependency-image]][devDependency-url] [![Code Climate][climate-image]][climate-url]

## Installation



## Usage

First, import the `ContainerQuery` object from this package:

```js
import ContainerQuery from 'container-queries';
```

Then, create the container queries around a given node using the `create` method:

```js
let myNode = document.getElementById('MyNode');
let containerQuery = ContainerQuery.create(myNode);
```

Finally, add your container query conditions using the `addQuery` method of the returned object. You can specify a `min` and/ or `max` width for which the query is considered active. By default, these measures are considered *inclusive*. If you wish to make one or both *exclusive*, pass the `inclusive` option with a value of `false` (all exclusive), `'min'` (max is exclusive), or `'max'` (min is exclusive).

In addition, ensure that you pass an `identifier`; this is the value that must be used in your stylesheets to respond to the query. You can also provide a `test` method instead of a min/ max, which must take the current width and return a boolean indicating whether the query should match given that width.

```js
containerQuery.addQuery({min: 320}, identifier: 'phone-up');
containerQuery.addQuery({min: 1000, max: 2000}, inclusive: 'min', identifier: 'big');
containerQuery.addQuery({
  test(width) { return (width % 2) === 0 },
  identifier: 'even',
})
```

These queries will automatically be updated as the parent of the node changes size.

Finally, in your CSS file, add a selector that will inform you of when a given query matches. This plugin uses the `data-container-query-matches` attribute to provide this information by populating it with a space-separated list of matching queries.

```css
.my-component[data-container-query-matches="phone-up"] {} /* only phone query matches */
.my-component[data-container-query-matches~="big"] {} /* big query (and possibly more) matches */
```

This plugin includes styling utilities for a variety of pre- and post-processors to make these declarations more friendly.


[travis-url]: https://travis-ci.org/lemonmade/container-queries
[travis-image]: https://travis-ci.org/lemonmade/container-queries.svg?branch=master

[coveralls-url]: https://coveralls.io/github/lemonmade/container-queries?branch=master
[coveralls-image]: https://coveralls.io/repos/lemonmade/container-queries/badge.svg?branch=master&service=github

[dependency-url]: https://david-dm.org/lemonmade/container-queries
[dependency-image]: https://david-dm.org/lemonmade/container-queries.svg

[devDependency-url]: https://david-dm.org/lemonmade/container-queries
[devDependency-image]: https://david-dm.org/lemonmade/container-queries.svg

[npm-url]: https://npmjs.org/package/container-queries
[npm-image]: http://img.shields.io/npm/v/container-queries.svg?style=flat-square

[climate-url]: https://codeclimate.com/github/lemonmade/container-queries
[climate-image]: http://img.shields.io/codeclimate/github/lemonmade/container-queries.svg?style=flat-square

[maintained-url]: https://github.com/lemonmade/container-queries/pulse
[maintained-image]: http://img.shields.io/badge/status-maintained-brightgreen.svg?style=flat-square
