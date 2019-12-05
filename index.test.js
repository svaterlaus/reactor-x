const Reactor = require('./index')
const { _value } = require('./lib/symbols')

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
  test('should update the value of the reactive item, returning that updated value for reactor.get(path) and reactor.valueOf()', () => {
    const person = { name: 'Spencer', age: 25, hobbies: ['programming', 'eating', 'exercise?'] }
    const reactivePerson = Reactor(person)

    expect(reactivePerson.get('name').valueOf()).toBe('Spencer')

    reactivePerson.update(p => ({ ...p, name: 'George' }))

    expect(reactivePerson.get('name').valueOf()).toBe('George')
    expect(reactivePerson.get('hobbies').valueOf()[0]).toBe('programming')
  })
})
