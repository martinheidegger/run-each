'use strict'
const test = require('tap').test
const runEach = require('../index.js').runEach
const setImmediate = require('set-immediate-shim')

test('simply executing an array', function () {
  return runEach([])
})

test('a non-collection should throw an error', function (t) {
  t.throws(function () {
    runEach(null)
  }, 'Tasks needs to be a collection')
  t.end()
})

test('passing a callback should use that instead of array', function (t) {
  const p = runEach([], function (err) {
    t.equals(err, null)
    t.end()
  })
  t.equal(p, undefined)
})

test('each task should be run in parallel', function (t) {
  const stack = []
  stack.push('start:start')
  runEach([
    delay(stack, 'a'),
    delay(stack, 'b')
  ], function () {
    t.deepEquals(stack, [
      'start:start',
      'end:start',
      'start:a',
      'start:b',
      'end:a',
      'end:b'
    ])
    t.end()
  })
  stack.push('end:start')
})

test('an error should be passed to the result', function (t) {
  runEach([
    function a (cb) {
      cb(new Error('x'))
    }
  ], function (err) {
    t.equals(err.message, 'x')
    t.end()
  })
})

test('the first error should be passed to the result, not the error of the first in-order function', function (t) {
  runEach([
    function a (cb) {
      setTimeout(cb, 10, new Error('x'))
    },
    function b (cb) {
      cb(new Error('y'))
    }
  ], function (err) {
    t.equals(err.message, 'y')
    t.end()
  })
})

test('The error should be propagated to the promise', function (t) {
  return t.rejects(runEach([
    function a (cb) {
      cb(new Error('x'))
    }
  ]))
})

test('each result should be passed to the result', function (t) {
  return runEach([
    function a (cb) { cb(null, 1) },
    function b (cb) { cb(null, 2) }
  ]).then(function (data) {
    t.deepEquals(Array.from(data), [1, 2])
  })
})

test('data is not collected without a handler that has enough params', function (t) {
  runEach([], function () {
    t.equals(arguments.length, 1)
    runEach([], function (err, data) {
      t.error(err)
      t.notEquals(data, null)
      t.end()
    })
  })
})

test('delays should not mess up the result order', function (t) {
  return runEach([
    function a (cb) { setTimeout(cb, 10, null, 'a') },
    function b (cb) { setTimeout(cb, 5, null, 'b') },
    function c (cb) { setTimeout(cb, 2, null, 'c') }
  ])
    .then(function (data) {
      t.deepEquals(Array.from(data), ['a', 'b', 'c'])
    })
})

test('concurrency argument order should be variable', function (t) {
  const stack = []
  return runEach([
    delay(stack, 'a'),
    delay(stack, 'b')
  ], function () {
    t.deepEquals(stack, [
      'start:a',
      'end:a',
      'start:b',
      'end:b'
    ])
    t.end()
  }, 1)
})

test('concurrency should be respected', function (t) {
  const stack = []
  return runEach([
    delay(stack, 'a'),
    delay(stack, 'b'),
    delay(stack, 'c'),
    delay(stack, 'd'),
    delay(stack, 'e')
  ], 2).then(function () {
    t.deepEquals(stack, [
      'start:a',
      'start:b',
      'end:a',
      'end:b',
      'start:c',
      'start:d',
      'end:c',
      'end:d',
      'start:e',
      'end:e'
    ])
  })
})

function delay (stack, name) {
  return function (cb) {
    stack.push('start:' + name)
    setImmediate(function () {
      stack.push('end:' + name)
      cb()
    })
  }
}
