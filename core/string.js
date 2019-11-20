const { _value, _reactor, _type } = require('../lib/symbols')
const { reactivePrototype } = require('./reactive')
const { withPrototype } = require('../lib/util')

const string = input => {
  if (typeof input !== 'string') {
    throw new Error('string() input must be a string')
  }
  return withPrototype({
    [_type]: 'string',
    [_value]: input,
    [_reactor]: string
  }, reactivePrototype)
}

module.exports = string
