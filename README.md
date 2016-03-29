# ContainerQueries

A set of utilities for creating simple, width-based container queries.

[![Build status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Maintained][maintained-image]][maintained-url] [![NPM version][npm-image]][npm-url] [![Dependency Status][dependency-image]][dependency-url] [![Dev Dependency Status][devDependency-image]][devDependency-url] [![Code Climate][climate-image]][climate-url]

## Installation




## Usage

### JavaScript

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
containerQuery.addQuery({min: 320, identifier: 'phone-up'});
containerQuery.addQuery({min: 1000, max: 2000, inclusive: 'min', identifier: 'big'});
containerQuery.addQuery({
  test: function(width) { return (width % 2) === 0 },
  identifier: 'even',
});
```

These queries will automatically be updated as the parent of the node changes size.

### HTML

As an alternative (or, in addition to) adding queries in JavaScript, you can embed them directly in your HTML. To do so, simply populate the `data-container-queries` attribute with a string representation of your queries. When doing a `min` query, use the `>` (or `>=`, for inclusivity) operator followed by the unit you wish to use. `max` queries can similarly be done using `<` and `<=` operators. A query with both a `min` and `max` uses both numbers, separated by ellipses, optionally with `>` and/ or `<` to specify exclusivity of the range (see example below).

```html
<div data-container-queries=">300"></div> <!-- greater than 300px, exclusive -->
<div data-container-queries="<=700"></div> <!-- less than 700px, inclusive -->
<div data-container-queries="300...700"></div> <!-- from 300px to 700px, inclusive on both sides -->
<div data-container-queries="300>..700"></div> <!-- from 300px to 700px, exclusive of 300px but inclusive of 700px -->
<div data-container-queries="300..<700"></div> <!-- from 300px to 700px, inclusive of 300px but exclusive of 700px -->
<div data-container-queries="300>..<700"></div> <!-- from 300px to 700px, exclusive on both sides -->
```

Note that you will still have to run some JavaScript for the script to detect and install these queries. You can do so using the static `createAllWithin` method of the imported `ContainerQuery` object, passing it the root of your document:

```javascript
import ContainerQuery from 'container-queries';
ContainerQuery.createAllWithin(document);
```

You must call this again whenever you are inserting new nodes into the DOM. You can cleanup after nodes are removed using the static `destroyAllWithin` method:

```javascript
import ContainerQuery from 'container-queries';

let nodeToRemove = document.getElementById('RemoveMe');
nodeToRemove.parentNode.removeChild(nodeToRemove);
ContainerQuery.destroyAllWithin(nodeToRemove);
```

### CSS

The CSS for updating styles according to container queries is the same regardless of whether the query was added in JavaScript or HTML. This plugin uses the `data-container-query-matches` attribute to provide this information by populating it with a space-separated list of matching queries. You can therefore write any attribute selector using this data attribute to update your styles:

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

[devDependency-url]: https://david-dm.org/lemonmade/container-queries/dev-status.svg
[devDependency-image]: https://david-dm.org/lemonmade/container-queries#info=devDependencies

[npm-url]: https://npmjs.org/package/container-queries
[npm-image]: http://img.shields.io/npm/v/container-queries.svg?style=flat-square

[climate-url]: https://codeclimate.com/github/lemonmade/container-queries
[climate-image]: http://img.shields.io/codeclimate/github/lemonmade/container-queries.svg?style=flat-square

[maintained-url]: https://github.com/lemonmade/container-queries/pulse
[maintained-image]: http://img.shields.io/badge/status-maintained-brightgreen.svg?style=flat-square
