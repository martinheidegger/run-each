'use strict'
const setImmediate = require('setimmediate2').setImmediate
const linkedList = require('./lib/linked-list.js')

function noop () {}

function once (fn) {
  let called = false
  if (fn.length < 2) {
    return function (err) {
      if (called === true) return
      called = true
      fn(err)
    }
  }
  return function (err, data) {
    if (called === true) return
    called = true
    fn(err, data)
  }
}

function _runEach (tasks, concurrency, next) {
  next = once(next)

  const iter = tasks[Symbol.iterator]()
  const result = next.length > 1 ? linkedList() : undefined
  let total = 0
  let done = 0
  let finish = concurrency > 0 ? setImmediate.bind(null, step) : noop

  function step () {
    if (concurrency > 0 && done + concurrency <= total) {
      return
    }
    const process = iter.next()
    if (process.done) {
      finish = function () {
        if (done === total) {
          next(null, result)
        }
      }
      finish()
      return
    }
    total += 1

    const node = (result !== undefined) ? result.add() : undefined

    process.value(function (err, value) {
      if (err) {
        next(err)
      }
      if (node !== undefined) {
        node.value = value
      }
      done += 1
      finish()
    })
    step()
  }

  setImmediate(step)
}

function runEach (tasks, concurrency, next) {
  if (typeof next === 'number') {
    return runEach(tasks, next, concurrency)
  }
  if (typeof concurrency !== 'number') {
    return runEach(tasks, 0, concurrency)
  }
  if (!tasks || typeof tasks[Symbol.iterator] !== 'function') {
    throw new Error('Tasks needs to be a collection')
  }

  concurrency = concurrency | 0

  if (typeof next !== 'function') {
    return new Promise(function (resolve, reject) {
      _runEach(tasks, concurrency, function (err, data) {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }
  _runEach(tasks, concurrency, next)
}

exports.runEach = runEach
