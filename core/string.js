const { _value } = require('../lib/symbols')
const { reactivePrototype } = require('./reactive')
const { withPrototype } = require('../lib/util')

const stringPrototype = withPrototype({
  valueOf () {
    return this[_value]
  }
}, reactivePrototype)

const string = input => {
  if (typeof input !== 'string') {
    throw new Error('string() input must be a string')
  }
  return withPrototype({
    [_value]: input
  }, stringPrototype)
}

module.exports = string
