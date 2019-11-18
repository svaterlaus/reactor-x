const { _value } = require('../lib/symbols')
const { reactivePrototype } = require('./reactive')
const { withPrototype } = require('../lib/util')

const numberPrototype = withPrototype({
  valueOf () {
    return this[_value]
  }
}, reactivePrototype)

const number = input => {
  if (typeof input !== 'number') {
    throw new Error('number() input must be a number')
  }
  return withPrototype({
    [_value]: input
  }, numberPrototype)
}

module.exports = number
