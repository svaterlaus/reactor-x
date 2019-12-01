const { Subject } = require('observable-x')
const { reduce, always, anyPass, pipe, equals, type, ifElse, curry, isNil, map, identity, cond, prop, T, when, call } = require('ramda')

const { _value, _subject } = require('./lib/symbols')

const { setPrototypeOf } = Object

const isMappable = pipe(
  type,
  anyPass([
    equals('Array'),
    equals('Object')
  ])
)

const isScalar = pipe(
  type,
  anyPass([
    equals('Number'),
    equals('String'),
    equals('Boolean'),
    equals('Null')
  ])
)

const isFunction = pipe(
  type,
  equals('Function')
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
  update (transform) {
    // 1. only update existing properties based on the input
    // 2. don't bother updating identical property values
    // 3. don't add additional properties from the input
    // 4. update properties missing from the input with null
    // (use basic type checking?)

    const value = this.valueOf()
    const transformed = when(isFunction, always(transform(value)))(transform)

    console.log(transformed)

    // this[_value] = cond([
    //   [isMappable, map(Reactor)]
    // ])(value)

    // if (isMappable(value)) {
    //   this[_value] = isFunction(transform) ? map()
    // } else {

    // }
    // this[_value] = isFunction(transform)
    //   ? isMappable(this[_value]) && map(Reactor, this[_value])
    //   : isScalar(this[_value]) && this[_value]

    // this[_value] = ifElse(
    //   isFunction,
    //   always(transform(this.valueOf())),
    //   transform
    // )(transform)
    return this[_value]
  },
  subscribe (callback) {
    this[_subject] = when(isNil, Subject(this[_value]))(this[_subject])
    this[_subject].observe({ next: callback })
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
