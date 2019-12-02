const { Subject } = require('observable-x')
const { reduce, always, anyPass, pipe, equals, type, ifElse, curry, isNil, map, identity, cond, prop, T, when, call, complement, mapObjIndexed } = require('ramda')

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

const isMappable = anyPass([
  isArray,
  isObject
])

const isScalar = pipe(
  type,
  anyPass([
    equals('Number'),
    equals('String'),
    equals('Boolean'),
    equals('Null')
  ])
)

const getKeyFromPath = curry((path, value) =>
  reduce((target, key) => ifElse(
    isNil,
    always(value[key]),
    always(target.get(key))
  )(target), null)(path)
)

const reactivePrototype = {
  valueOf () {
    return ifElse(
      isMappable,
      pipe(prop('valueOf'), call),
      identity
    )(this[_value])
  },
  get (path) {
    return cond([
      [always(isMappable(path)), getKeyFromPath(path)],
      [always(isScalar(path)), prop(path)],
      [T, always(undefined)]
    ])(this[_value])
  },
  update (transform, innerValue = this.valueOf()) {
    const updated = when(isFunction, always(transform(innerValue)))(transform)
    const subject = this[_subject]

    return ifElse(
      always(isObject(innerValue)),
      mapObjIndexed((item, key) => {
        when(isNotNil, always(subject.next(innerValue)))(subject)
        return item.update(updated[key], innerValue[key])
      }),
      always(updated)
    )(this)
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

const Reactor = state => cond([
  [isMappable, pipe(map(Reactor), makeReactive)],
  [isScalar, makeReactive],
  [T, always(undefined)]
])(state)

module.exports = Reactor
