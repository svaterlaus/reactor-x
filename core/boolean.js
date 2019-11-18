const { _value } = require('../lib/symbols')
const {
  reactivePrototype,
  withPrototype
} = require('../lib/util')

const booleanPrototype = withPrototype({
  valueOf () {
    return this[_value]
  }
}, reactivePrototype)

const boolean = input => {
  if (typeof input !== 'boolean') {
    throw new Error('boolean() input must be a boolean')
  }
  return withPrototype({
    [_value]: input
  }, booleanPrototype)
}

module.exports = boolean
