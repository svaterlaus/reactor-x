const { _value, _reactor, _type, _isReactive } = require('../lib/symbols')
const { reactivePrototype } = require('./reactive')
const { withPrototype, isObject } = require('../lib/util')

const objectPrototype = withPrototype({
  valueOf () {
    return Object.keys(this[_value]).reduce((result, key) => {
      const value = this[_value][key]
      if (!value[_isReactive]) {
        throw new Error(`value at "${key}" property must be reactive`)
      }
      return { ...result, [key]: value.valueOf() }
    }, {})
  },
  reconcile (input) {
    const inputValue = input.valueOf()
    if (typeof this[_value] !== typeof inputValue) {
      throw new Error(`cannot reconcile input of type ${typeof inputvalue} with schema of type ${typeof this[_value]}`)
    }
    return Object.keys(this[_value]).reduce((result, key) => {
      return this[_reactor]({ ...result, [key]: this[_value][key].reconcile(inputValue[key]) })
    }, {})
  }
}, reactivePrototype)

const object = input => {
  // validate that input is either a POJO or reactive object
  input = isObject(input)
    ? input
    : input[_type] === 'object'
      ? input[_value]
      : null
  if (input === null) {
    throw new Error('object() input must be a plain object')
  }

  // validate that input properties are reactive
  Object.keys(input).forEach(key => {
    if (!input[key][_isReactive]) {
      throw new Error('object() input\'s properties must all be reactive')
    }
  })

  return withPrototype({
    [_type]: 'object',
    [_value]: input,
    [_reactor]: object
  }, objectPrototype)
}

module.exports = object
