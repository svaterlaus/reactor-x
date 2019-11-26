const { _value } = require('./lib/symbols')

const { isArray } = Array
const { keys: keysOf } = Object

const isPOJO = obj => obj === null || typeof obj !== 'object'
  ? false
  : Object.getPrototypeOf(obj) === Object.prototype

const isScalar = val =>
  val === null ||
  typeof val === 'string' ||
  typeof val === 'boolean' ||
  (typeof val === 'number' && val > -Infinity && val < Infinity)

const objMap = (obj, transform) => keysOf(obj)
  .reduce((result, key) => ({ ...result, [key]: transform(obj[key]) }), {})

const isJSONSerializable = value => {
  if (isArray(value)) {
    return value.reduce((result, item) => !result ? result : isJSONSerializable(item), true)
  }
  if (isPOJO(value)) {
    return keysOf(value).reduce((result, key) => !result ? result : isJSONSerializable(value[key]), true)
  }
  if (isScalar(value)) {
    return true
  }
  return false
}

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
  },
  get (path) {
    if (isArray(path)) {
      let isFirst = true
      return path.reduce((result, key) => {
        const value = isFirst ? this[_value][key] : result.get(key)
        isFirst = false
        return value
      }, null)
    }
    if (typeof path === 'string' || typeof path === 'number') {
      return this[_value][path]
    }
    throw new Error(`reactor.get() argument must be an array, string, or number . Received: ${path}`)
  },
  update (transform) {
    const updated = typeof transform === 'function' ? transform(this.valueOf()) : transform
    if (!isJSONSerializable(updated)) {
      throw new Error('reactor.update() argument must be JSON-serializable, or a function with a JSON-serializable return value')
    }
    this[_value] = updated
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

const Reactor = state => {
  if (isArray(state)) {
    return reactive(state.map(Reactor))
  }
  if (isPOJO(state)) {
    return reactive(objMap(state, Reactor))
  }
  if (isScalar(state)) {
    return reactive(state)
  }
  throw new Error(`Reactor() argument must be JSON-serializable. Received: ${state}`)
}

module.exports = Reactor
