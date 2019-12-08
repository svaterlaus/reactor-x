const { Subject } = require('observable-x')
const { __, reduce, always, pipe, equals, type, ifElse, curry, isNil, map, identity, cond, prop, T, when, complement, mapObjIndexed, applyTo, and, apply, bind, both, all } = require('ramda')

const { _value, _subject, _parent } = require('./lib/symbols')

const log = label => value => {
  console.log(`${label}: `, value)
  return value
}

const wrap = value => [value]

const method = curry((name, args, object) => pipe(
  prop(name),
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

const notifyParents = item => {
  const parent = prop(_parent, item)
  if (isNotNil(parent)) {
    const parentSubject = parent[_subject]
    const parentValue = parent.valueOf()
    method('next', [parentValue], parentSubject)
    notifyParents(parent)
  }
}

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
  update (transform, value = this.valueOf(), isInitial = true) { // TODO cleanup function
    const updated = when(isFunction, applyTo(value))(transform)
    const subject = this[_subject]
    const final = ifElse(
      always(and(isObject(value), isObject(updated))),
      pipe(
        mapObjIndexed((item, key) =>
          method('update', [prop(key, updated), prop(key, value), false])(item)
        ),
        sideEffect(pipe(wrap, method('next', __, subject)))
      ),
      (input) => {
        this[_value] = updated
        method('next', [updated], subject)
        return this[_value]
      }
    )(this[_value])

    if (isInitial && isNotNil(this[_parent])) {
      notifyParents(this)
    }
    return final
  },
  subscribe (callback) {
    if (!isFunction(callback)) {
      return undefined
    }
    const value = this.valueOf()
    this[_subject] = when(isNil, always(Subject(value)))(this[_subject])
    return this[_subject].observe({ next: callback })
  }
}

const makeReactive = curry((parent, state) => {
  const result = {
    [_value]: state,
    [_parent]: parent,
    [_subject]: null
  }
  setPrototypeOf(result, reactivePrototype)
  return result
})

const Reactor = state => {
  const recur = curry((parent, innerState) => {
    const reactiveState = makeReactive(parent, innerState)
    reactiveState[_value] = when(isObject, map(recur(reactiveState)))(reactiveState[_value])
    return reactiveState
  })
  return recur(null, state)
}

module.exports = Reactor
