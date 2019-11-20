const { Subject } = require('observable-x/core')
const { _isReactive, _value, _subject, _reactor } = require('../lib/symbols')

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
    const keys = Array.isArray(path) ? path : path.split('.') // TODO handle bracket property access

    let isFirst = true
    return keys.reduce((result, key) => {
      const value = isFirst ? this[_value][key] : result.get(key)
      isFirst = false
      return value
    }, null)
  },
  reconcile (input) {
    const value = input.valueOf()
    if (typeof this[_value] !== typeof value) {
      throw new Error(`cannot reconcile input of type ${typeof value} with schema of type ${typeof this[_value]}`)
    }
    return this[_reactor](value)
  },
  update (transform) {
    const plainValue = typeof transform === 'function'
      ? transform(this[_value].valueOf())
      : transform.valueOf()

    this[_value] = this.reconcile(plainValue)

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
