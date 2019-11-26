const { _value } = require('./lib/symbols')

const { isArray } = Array

const isPOJO = obj => obj === null || typeof obj !== 'object'
  ? false
  : Object.getPrototypeOf(obj) === Object.prototype

const isScalar = val =>
  val === null ||
  typeof val === 'string' ||
  typeof val === 'boolean' ||
  (typeof val === 'number' && val > -Infinity && val < Infinity)

const objMap = (obj, transform) => Object.keys(obj)
  .reduce((result, key) => ({ ...result, [key]: transform(obj[key]) }), {})

const reactivePrototype = {
  valueOf () {
    const value = this[_value]
    if (isArray(value)) {
      return value.map(item => item.valueOf())
    }
    if (isPOJO(value)) {
      return objMap(value, prop => prop.valueOf())
    }
    return this[_value]
  }
}

const reactive = state => {
  const result = {
    [_value]: state
  }

  Object.setPrototypeOf(result, reactivePrototype)
  return result
}

const reactor = state => {
  if (isArray(state)) {
    return reactive(state.map(reactor))
  }
  if (isPOJO(state)) {
    return reactive(objMap(state, reactor))
  }
  if (isScalar(state)) {
    return reactive(state)
  }
  throw new Error(`Reactor argument must be JSON-serializable. Received: ${state}`)
}

module.exports = reactor
