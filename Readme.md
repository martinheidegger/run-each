# run-each

<a href="https://travis-ci.org/martinheidegger/run-each"><img src="https://travis-ci.org/martinheidegger/run-each.svg?branch=master" alt="Build Status"/></a>
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Maintainability](https://api.codeclimate.com/v1/badges/338cdb4001fbee61ad73/maintainability)](https://codeclimate.com/github/martinheidegger/run-each/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/338cdb4001fbee61ad73/test_coverage)](https://codeclimate.com/github/martinheidegger/run-each/test_coverage)

`run-each` is a **very small**, **flexible**, **parallel** async iteration helper that has first-class support for [Iterators][]
(unlike other libraries, which mostly break with iterators) and **concurrency**. It also has complete TypeScript header files for
comfortable integration.

[Iterators]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols

`npm i run-each --save`

It is similar to [`each`][], [`async-each`][], [`each-async`][], ... and many other.

```javascript
const { runEach } = require('run-each')

runEach(
  [
    function (callback) {
      callback()
    },
    function (callback) {
      callback()
    }
  ],
  function (err) {
    // Done once all functions are done
  }
)
```

[`each`]: https://www.npmjs.com/package/each
[`async-each`]: https://www.npmjs.com/package/each
[`each-async`]: https://www.npmjs.com/package/each-async

There are several things that make this different:

- It returns an `Iterable` object instead of an Array.
- It supports `Promises` in case you prefer to use async/await with your API's
- It supports `concurrency` limits to limit the amount of commands executed at the same time.


## Iterable results

Like in other libraries you can get the result, but unlike other libraries, its not
an Array, so you need to apply an `Array.from` to it.

```javascript
runEach([
  function (callback) {
    callback('a')
  },
  function (callback) {
    callback('b')
  }
], function (err, data) {
  Array.from(data) === ['a', 'b'] // the order is protected
})
```

_Note:_ This is more of an internal detail, but if the passed-in function doesn't have
a second parameter, the data will not be collected.

```javascript
runEach([], function () {
  console.log(arguments.length) // 1
})

runEach([], function (err, data) {
  console.log(arguments.length) // 2
})
```

## Promise support

If you don't pass in a callback handler at the end, it will automatically return a Promise.

```javascript
runEach([/*...*/]).then(function () {
  // all done
})
```

## Concurrency

By passing a concurrency limit to the runner, it will limit the amount of parallel
executions

```javascript
runEach([/*...*/], 1).then(function () {
  // now each operation is run in series.
})
runEach([/*...*/], 2).then(function () {
  // now two operations are run at the same time
})
```

### License

MIT
