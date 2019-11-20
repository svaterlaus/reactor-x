const { _value, _reactor, _type } = require('../lib/symbols')
const { reactivePrototype } = require('./reactive')
const { withPrototype } = require('../lib/util')

const array = input => {
  if (!Array.isArray(input)) {
    throw new Error('array() input must be an array')
  }
  return withPrototype({
    [_type]: 'array',
    [_value]: input,
    [_reactor]: array
  }, reactivePrototype)
}

module.exports = array
