const { _value } = require('../lib/symbols')
const { reactivePrototype } = require('./reactive')
const {
  withPrototype,
  isReactive,
  isObject
} = require('../lib/util')

const objectPrototype = withPrototype({
  valueOf () {
    return Object.keys(this[_value]).reduce((result, key) => {
      const value = this[_value][key]
      if (!isReactive(value)) {
        throw new Error(`value at "${key}" property must be reactive`)
      }
      return { ...result, [key]: value.valueOf() }
    }, {})
  }
}, reactivePrototype)

const object = input => {
  if (!isObject(input)) {
    throw new Error('object() input must be a plain object')
  }
  return withPrototype({
    [_value]: { ...input }
  }, objectPrototype)
}

module.exports = object
