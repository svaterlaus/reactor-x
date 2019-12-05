const { Subject } = require('observable-x')
const { __, reduce, always, pipe, equals, type, ifElse, curry, isNil, map, identity, cond, prop, T, when, complement, mapObjIndexed, applyTo, and, apply, tryCatch, bind, both, all } = require('ramda')

const log = label => value => {
  console.log(`${label}: `, value)
  return value
}

const method = curry((name, args, object) => pipe(
  tryCatch(prop(name), always(undefined)), // TODO refactor out inneficient tryCatch behavior
  ifElse(
    isNil,
    identity,
    pipe(
      bind(__, object),
      apply(__, args)
    )
  )
)(object))

const sideEffect = curry((fn, val) => {
  fn(val)
  return val
})

const isNotNil = complement(isNil)

const { _value, _subject } = require('./lib/symbols')

const { setPrototypeOf } = Object

const isFunction = pipe(
  type,
  equals('Function')
)

const isObject = pipe(
  type,
  equals('Object')
)

const isArray = pipe(
  type,
  equals('Array')
)

const isString = pipe(
  type,
  equals('String')
)

const getReactiveProp = curry((path, value) => ifElse(
  always(isObject(value)),
  reduce((target, key) => ifElse(
    isNil,
    always(prop(key, value)),
    method('get', [key])
  )(target), null),
  always(undefined)
)(path))

const reactivePrototype = {
  valueOf () {
    return ifElse(
      isObject,
      map(when(isNotNil, method('valueOf', []))),
      identity
    )(this[_value])
  },
  get (path) {
    return ifElse(
      isObject,
      cond([
        [always(both(isArray, all(isString))(path)), getReactiveProp(path)],
        [always(isString(path)), prop(path)],
        [T, always(undefined)]
      ]),
      always(undefined)
    )(this[_value])
  },
  update (transform, innerValue = this.valueOf()) {
    const updated = when(isFunction, applyTo(innerValue))(transform)
    const subject = this[_subject]

    return ifElse(
      always(and(isObject(innerValue), isObject(updated))),
      mapObjIndexed((item, key) => pipe(
        sideEffect(when(
          always(isNotNil(subject)),
          always(method('next', [innerValue], subject))
        )),
        method('update', [prop(key, updated), prop(key, innerValue)])
      )(item)),
      pipe(
        sideEffect(() => { this[_value] = updated }),
        always(updated)
      )
    )(this[_value])
  },
  subscribe (callback) {
    const value = this.valueOf()
    this[_subject] = when(isNil, always(Subject(value)))(this[_subject])
    return this[_subject].observe({ next: callback })
  }
}

const makeReactive = state => {
  const result = {
    [_value]: state,
    [_subject]: null
  }
  setPrototypeOf(result, reactivePrototype)
  return result
}

const Reactor = state => ifElse(
  isObject,
  pipe(map(Reactor), makeReactive),
  makeReactive
)(state)

module.exports = Reactor
