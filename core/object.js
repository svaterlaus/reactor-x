const { _value } = require('../lib/symbols')
const {
  reactivePrototype,
  withPrototype,
  isReactive,
  isObject
} = require('../lib/util')

const objectPrototype = withPrototype({
  valueOf () {
    return Object.keys(this[_value]).reduce((result, key) => {
      if (!isReactive(this[_value][key])) {
        throw new Error(`value at "${key}" property must be reactive`)
      }
      return { ...result, [key]: this[_value][key].valueOf() }
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
