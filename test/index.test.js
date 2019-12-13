const { Reactor, observableFrom } = require('../src/index')
const { _value } = require('../src/symbols')

describe('Reactor()', () => {
  test('should return an object with a _value symbol property (a reactive item) for any given input', () => {
    const obj = {}
    const arr = []
    const str = ''
    const num = 0
    const err = new Error()
    const fn = function () {}

    expect(Reactor()).toHaveProperty([_value])
    expect(Reactor(obj)).toHaveProperty([_value])
    expect(Reactor(arr)).toHaveProperty([_value])
    expect(Reactor(str)).toHaveProperty([_value])
    expect(Reactor(num)).toHaveProperty([_value])
    expect(Reactor(err)).toHaveProperty([_value])
    expect(Reactor(fn)).toHaveProperty([_value])
  })
  test('should return a reactive object with reactive properties and nested properties for a given object input', () => {
    const obj = { foo: 'bar', nested: { num: 9 } }
    expect(Reactor(obj)[_value].foo).toHaveProperty([_value])
    expect(Reactor(obj)[_value].nested[_value].num).toHaveProperty([_value])
  })
  test('should return a reactive object with all non-object property values being equal to the associated property values for a given object input', () => {
    const obj = { foo: 'bar', nested: { num: 9 } }
    expect(Reactor(obj)[_value].foo[_value]).toBe('bar')
    expect(Reactor(obj)[_value].nested[_value].num[_value]).toBe(9)
  })
})

describe('reactor.valueOf()', () => {
  test('should return a value equal to the argument given to Reactor()', () => {
    const number = 123
    const string = 'foo bar'
    const boolean = false
    const person = { name: 'Spencer', age: 25, hobbies: ['programming', 'eating', 'exercise?'] }

    expect(Reactor(number).valueOf()).toEqual(number)
    expect(Reactor(string).valueOf()).toEqual(string)
    expect(Reactor(boolean).valueOf()).toEqual(boolean)
    expect(Reactor(person).valueOf()).toEqual(person)
  })
})

describe('reactor.get()', () => {
  test('should return undefined when given anything other than an array of strings or a string', () => {
    const person = {
      name: 'Spencer',
      age: 25,
      hobbies: ['programming', 'eating', 'exercise?'],
      foo: { bar: 'baz' },
      9: 'nine',
      null: 'nullified',
      undefined: 'definitely undefined'
    }

    expect(Reactor(person).get(undefined)).toBe(undefined)
    expect(Reactor(person).get(new Date())).toBe(undefined)
    expect(Reactor(person).get({ foo: 'bar' })).toBe(undefined)
    expect(Reactor(person).get(null)).toBe(undefined)
    expect(Reactor(person).get(9)).toBe(undefined)
    expect(Reactor(person).get(['hobbies', 1])).toBe(undefined)

    expect(Reactor(person).get('age')).not.toBe(undefined)
    expect(Reactor(person).get(['age'])).not.toBe(undefined)
    expect(Reactor(person).get(['foo', 'bar'])).not.toBe(undefined)
  })
  test('should return the reactive item at the path argument, or undefined if path is invalid', () => {
    const person = {
      name: 'Spencer',
      age: 25,
      hobbies: ['programming', 'eating', 'exercise?'],
      foo: { bar: 'baz' }
    }

    expect(Reactor(person).get('name')[_value]).toBe('Spencer')
    expect(Reactor(person).get('age')[_value]).toBe(25)
    expect(Reactor(person).get(['foo', 'bar'])[_value]).toBe('baz')

    expect(Reactor(person).get('gender')).toBe(undefined)
    expect(Reactor(person).get(['foo', 'bar', 'baz'])).toBe(undefined)
  })
  test('should return undefined when given a path argument for anything other than an object property', () => {
    const person = {
      name: 'Spencer',
      age: 25,
      hobbies: ['programming', 'eating', 'exercise?'],
      foo: { bar: 'baz' }
    }
    const list = [1, 2, 3]

    expect(Reactor(person).get(['hobbies', '1'])).toBe(undefined)
    expect(Reactor(list).get('0')).toBe(undefined)
  })
})

describe('reactor.update()', () => {
  test('should update the value of the reactive item given an update function or a plain value, returning that updated value for reactor.get(path) and reactor.valueOf()', () => {
    const person = { name: 'Spencer', age: 25, hobbies: ['programming', 'eating', 'exercise?'] }
    const reactivePerson = Reactor(person)

    expect(reactivePerson.get('name').valueOf()).toBe('Spencer')

    reactivePerson.update(p => ({ ...p, name: 'George' })) // TODO should return the plain value or the reactive value (for chaining?)

    expect(reactivePerson.get('name').valueOf()).toBe('George')
    expect(reactivePerson.get('hobbies').valueOf()[0]).toBe('programming')

    reactivePerson.update({ name: 'Bob' })

    expect(reactivePerson.valueOf().name).toBe('Bob')
    expect(reactivePerson.get('name').valueOf()).toBe('Bob')
  })
  test('should only update the inner object properties if an identical property name and structure is included in the transform', () => {
    const reactive = Reactor({ foo: { bar: 'baz' } })

    reactive.update({ something: 'else', foo: { bar: 'BLAM' } })
    expect(reactive).toEqual(Reactor({ foo: { bar: 'BLAM' } }))

    reactive.update({ foo: 'not good...' })
    expect(reactive).toEqual(Reactor({ foo: { bar: 'BLAM' } }))

    reactive.update(undefined)
    expect(reactive).toEqual(Reactor({ foo: { bar: 'BLAM' } }))

    reactive.update('just a string')
    expect(reactive).toEqual(Reactor({ foo: { bar: 'BLAM' } }))

    reactive.update({ foo: {} })
    expect(reactive).toEqual(Reactor({ foo: { bar: 'BLAM' } }))
  })
})

describe('reactor.subscribe()', () => {
  test('should return undefined when given anthing other than a function', () => {
    const person = { name: 'Spencer', age: 25, hobbies: ['programming', 'eating', 'exercise?'] }
    const reactivePerson = Reactor(person)

    expect(reactivePerson.subscribe()).toBe(undefined)
    expect(reactivePerson.subscribe(1)).toBe(undefined)
    expect(reactivePerson.subscribe('a string')).toBe(undefined)
    expect(reactivePerson.subscribe({ foo: 'bar' })).toBe(undefined)
    expect(reactivePerson.subscribe([1, 2, 3])).toBe(undefined)

    expect(reactivePerson.subscribe(() => {})).not.toBe(undefined)
  })
  test('should synchronously invoke the provided callback with the current value of the reactor when invoked', () => {
    expect.assertions(1)
    const person = { name: 'Spencer', age: 25, hobbies: ['programming', 'eating', 'exercise?'] }
    const reactivePerson = Reactor(person)

    const callback = state => {
      expect(state).toEqual(person)
    }

    reactivePerson.subscribe(callback)
  })
  test('should synchronously invoke the provided callback with the updated value of the reactor when reactor.update() is invoked', () => {
    expect.assertions(1)
    const person = { name: 'Spencer', age: 25, hobbies: ['programming', 'eating', 'exercise?'] }
    const reactivePerson = Reactor(person)

    let callbackInvoked = false
    const callback = state => {
      if (callbackInvoked) {
        expect(state).toEqual({ ...person, age: 26 })
      }
      callbackInvoked = true
    }

    reactivePerson.subscribe(callback)
    reactivePerson.update({ ...person, age: 26 })
  })
  test('should invoke the provided callback with the updated value of the reactor when reactor.update() is asynchronously invoked', done => {
    expect.assertions(1)
    const person = { name: 'Spencer', age: 25, hobbies: ['programming', 'eating', 'exercise?'] }
    const updated = { ...person, age: 26 }
    const reactivePerson = Reactor(person)

    let callbackInvoked = false
    const callback = state => {
      if (callbackInvoked) {
        expect(state).toEqual(updated)
        done()
      }
      callbackInvoked = true
    }

    reactivePerson.subscribe(callback)
    setTimeout(() => {
      reactivePerson.update(updated)
    }, 100)
  })
  test('should invoke the provided callback when child properties, nested or not, are updated via their own "update" method', () => {
    expect.assertions(1)
    const obj = { foo: { bar: 'baz' } }
    const reactiveObj = Reactor(obj)

    let callbackInvoked = false
    const callback = state => {
      if (callbackInvoked) {
        expect(state).toEqual({ foo: { bar: 'updated!' } })
      }
      callbackInvoked = true
    }

    reactiveObj.subscribe(callback)
    reactiveObj.get(['foo', 'bar']).update('updated!')
  })
  test('should invoke the provided callback when parent objects, one or more levels up, are updated via their own "update" method', () => {
    expect.assertions(1)
    const reactiveObj = Reactor({ foo: { bar: 'baz' } })

    let callbackInvoked = false
    const callback = state => {
      if (callbackInvoked) {
        expect(state).toEqual('updated!')
      }
      callbackInvoked = true
    }

    reactiveObj.get(['foo', 'bar']).subscribe(callback)
    reactiveObj.update(o => {
      o.foo.bar = 'updated!'
      return o
    })
  })
  test('should return an "unsubscribe" function that can be invoked to cancel the update subscription', () => {
    expect.assertions(1)
    const sentence = Reactor('this is reactive!')

    let callbackInvoked = false
    const callback = update => {
      if (callbackInvoked) {
        expect(update).toBe('Spencer is my name!')
      }
      callbackInvoked = true
    }
    const unsubscribe = sentence.subscribe(callback)

    sentence.update('Spencer is my name!')
    unsubscribe()
    sentence.update('Spencer is NOT my name?')
  })
  test('should only notify subscribers when the updated value is different than the pre-updated value', () => {
    expect.assertions(1)
    const reactive = Reactor({ foo: { bar: true } })

    let callbackInvoked = false
    reactive.get(['foo', 'bar']).subscribe(update => {
      if (callbackInvoked) {
        expect(update).toBe(false)
      }
      callbackInvoked = true
    })

    reactive.update({ foo: { bar: true } })
    reactive.update({ foo: { bar: false } })
  })
  test('should return a fully non-reactive object given an update object with missing properties', done => {
    expect.assertions(2)
    const reactive = Reactor({ foo: { bar: true }, baz: false })

    let callbackInvoked = false
    reactive.subscribe(updated => {
      if (callbackInvoked) {
        const { foo, foo: { bar } } = updated
        expect(foo[_value]).toBe(undefined)
        expect(bar[_value]).toBe(undefined)
        done()
      }
      callbackInvoked = true
    })
    reactive.update({ foo: {}, baz: true })
  })
})

describe('observableFrom()', () => {
  test('should return an observable that, when subscribed, will produce the same update values as reactor.subscribe()', done => {
    expect.assertions(2)
    const reactive = Reactor({ foo: { bar: true } })

    observableFrom(reactive).subscribe({
      next: e => {
        expect(e).toEqual({ foo: { bar: true } })
      }
    })
    observableFrom(reactive).subscribe(e => {
      expect(e).toEqual({ foo: { bar: true } })
      done()
    })
  })
})
