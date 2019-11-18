const { _isReactive, _value } = require('./symbols.js')

const isReactive = input => input !== null && input !== undefined && input[_isReactive]

const isObject = input => {
  if (input === null || typeof input !== 'object') {
    return false
  }
  return Object.getPrototypeOf(input) === Object.prototype
}

const isNumber = input => typeof input === 'number'

const isString = input => typeof input === 'string'

const withPrototype = (target, prototype) => {
  if (!isObject(target)) {
    throw new Error('withPrototype() target input must be a plain object')
  }
  if (typeof prototype !== 'object') {
    throw new Error('withPrototype() prototype input must be null or a plain object')
  }
  const copy = { ...target }
  Object.setPrototypeOf(copy, prototype)
  return copy
}

const reactivePrototype = {
  [_isReactive]: true,
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
  }
}

module.exports = {
  reactivePrototype,
  withPrototype,
  isReactive,
  isObject,
  isNumber,
  isString
}
