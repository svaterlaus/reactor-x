const { _value, _reactor, _type } = require('../lib/symbols')
const { reactivePrototype } = require('./reactive')
const { withPrototype } = require('../lib/util')

const number = input => {
  if (typeof input !== 'number') {
    throw new Error('number() input must be a number')
  }
  return withPrototype({
    [_type]: 'number',
    [_value]: input,
    [_reactor]: number
  }, reactivePrototype)
}

module.exports = number
