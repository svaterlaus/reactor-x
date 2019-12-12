const { reduce, always, pipe, ifElse, curry, isNil, map, identity, cond, prop, T, when, complement, mapObjIndexed, applyTo, both, all, equals } = require('ramda')
const { Observable, BehaviorSubject } = require('rxjs')

const { _value, _subject, _parent } = require('./symbols')
const { method, isObject, isArray, isString, isFunction, sideEffect } = require('./util')

const { setPrototypeOf } = Object

const isNotNil = complement(isNil)
const isNotObject = complement(isObject)
const notEquals = complement(equals)

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
  update (transform, value = this.valueOf(), isInitial = true) {
    const updated = when(isFunction, applyTo(value))(transform)
    const subject = this[_subject]
    const parent = this[_parent]

    if (isObject(value) && isNotObject(updated)) {
      return value
    }
    const result = ifElse(
      always(isObject(value) && isObject(updated)),
      pipe(
        mapObjIndexed((item, key) => item.update(updated[key], value[key], false)),
        sideEffect(nextValue => {
          if (notEquals(value, nextValue)) {
            method('next', [nextValue], subject)
          }
        })
      ),
      pipe(
        sideEffect(() => {
          if (notEquals(this[_value], updated)) {
            this[_value] = updated
            method('next', [updated], subject)
          }
        }),
        always(updated)
      )
    )(this[_value])

    if (isInitial && isNotNil(parent)) {
      notifyParents(this)
    }
    return result
  },
  subscribe (callback) {
    if (!isFunction(callback)) {
      return undefined
    }
    if (isNil(this[_subject])) {
      this[_subject] = new BehaviorSubject(this.valueOf())
    }
    const subscriber = this[_subject].subscribe({ next: callback })
    return () => { subscriber.unsubscribe() }
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
