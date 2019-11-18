const { Subject } = require('observable-x/core')
const { _isReactive, _value, _subject, _self } = require('../lib/symbols')

const reactivePrototype = {
  [_self]: this,
  [_isReactive]: true,
  [_subject]: null,
  get (path) {
    if (!Array.isArray(path) && typeof path !== 'string') {
      throw new Error('get() path must be an array of strings, or a dot-separated string')
    }
    const keys = Array.isArray(path) ? path : path.split('.')

    let isFirst = true
    return keys.reduce((result, key) => {
      const value = isFirst ? this[_value][key] : result.get(key)
      isFirst = false
      return value
    }, null)
  },
  update (transform) {
    if (typeof transform === 'function') {
      this[_value] = transform(this.valueOf())
    } else {
      this[_value] = transform
    }

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
        callback(this.valueOf())
      }
    })
  }
}

module.exports = { reactivePrototype }
