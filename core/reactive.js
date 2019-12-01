const { Subject } = require('observable-x/core')
const { _isReactive, _value, _subject, _reactor, _reconcile } = require('../lib/symbols')

const hasReactiveProps = obj => typeof obj === 'object'
  ? !!Object.keys(obj).filter(key => obj[key][_isReactive]).length
  : false

const parseKeys = path => Array.isArray(path) ? path : path.split('.') // TODO handle bracket property access

const reactivePrototype = {
  [_isReactive]: true,
  [_subject]: null,
  valueOf () {
    return this[_value]
  },
  get (path) {
    if (!Array.isArray(path) && typeof path !== 'string') {
      throw new Error('get() path must be an array of strings, or a dot-separated string')
    }
    const keys = parseKeys(path)

    let isFirst = true
    return keys.reduce((result, key) => {
      const value = isFirst ? this[_value][key] : result.get(key)
      isFirst = false
      return value
    }, null)
  },
  [_reconcile] (input) {
    const value = input.valueOf()
    if (typeof this[_value] !== typeof value) {
      throw new Error(`cannot reconcile input of type ${typeof value} with schema of type ${typeof this[_value]}`)
    }
    return this[_reactor](value)
  },
  update (transform) {
    if (transform[_isReactive] || hasReactiveProps(transform)) {
      throw new Error('update() input cannot be reactive')
    }
    const plainValue = typeof transform === 'function'
      ? transform(this[_value].valueOf())
      : transform

    this[_value] = this[_reconcile](plainValue)

    if (this[_subject]) {
      this[_subject].next(this[_value])
    }
  },
  subscribe (callback) {
    if (!this[_subject]) {
      this[_subject] = Subject(this[_value])
    }
    this[_subject].observe({
      next: value => {
        callback(this[_reactor](value).valueOf())
      }
    })
  }
}

module.exports = { reactivePrototype }
