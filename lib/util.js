const { _isReactive } = require('./symbols.js')

const isReactive = input => input !== null && input !== undefined && input[_isReactive]

const isObject = input => {
  if (input === null || typeof input !== 'object') {
    return false
  }
  return Object.getPrototypeOf(input) === Object.prototype
}

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

module.exports = {
  withPrototype,
  isReactive,
  isObject
}
