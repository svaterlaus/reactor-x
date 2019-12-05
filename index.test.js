const Reactor = require('./index')

describe('Reactor()', () => {
  test('should return undefined when given an argument that\'s not a string, array, number, boolean, object, or null', () => {
    expect(Reactor(undefined)).toBe(undefined)
    expect(Reactor(new Set())).toBe(undefined)
    expect(Reactor(new Error())).toBe(undefined)
    expect(Reactor(Array)).toBe(undefined)

    expect(Reactor({})).not.toBe(undefined)
    expect(Reactor([])).not.toBe(undefined)
    expect(Reactor(9)).not.toBe(undefined)
    expect(Reactor('foo')).not.toBe(undefined)
    expect(Reactor(false)).not.toBe(undefined)
    expect(Reactor(null)).not.toBe(undefined)
  })
  test('should return undefined for properties, or nested properties, that are not a string, array, number, boolean, object, or null', () => {
    expect(Reactor({ name: 'Spencer', problem: new Error() }).valueOf()).toEqual({ name: 'Spencer', problem: undefined })
    expect(Reactor(['Spencer', [[[{ veryNested: Set }]]]]).valueOf()).toEqual(['Spencer', [[[{ veryNested: undefined }]]]])
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
  test('should return undefined when given anything other than an array, string, or number', () => {
    const person = { name: 'Spencer', age: 25, hobbies: ['programming', 'eating', 'exercise?'] }

    expect(Reactor(person).get(undefined)).toBe(undefined)
    expect(Reactor(person).get(new Date())).toBe(undefined)
    expect(Reactor(person).get({ foo: 'bar' })).toBe(undefined)

    expect(Reactor(person).get('age')).not.toBe(undefined)
    expect(Reactor(person).get(['age'])).not.toBe(undefined)
    expect(Reactor(person).get(['hobbies', 1])).not.toBe(undefined)
  })
  test('should return the reactive item at the path argument, or undefined if path is invalid', () => {
    const person = { name: 'Spencer', age: 25, hobbies: ['programming', 'eating', 'exercise?'] }

    expect(Reactor(person).get('age')).not.toBe(25)
    expect(Reactor(person).get('age').valueOf()).toBe(25)
    expect(Reactor(person).get(['hobbies', 1])).not.toBe('eating')
    expect(Reactor(person).get(['hobbies', 1]).valueOf()).toBe('eating')
    expect(Reactor(person).get('gender')).toBe(undefined)
    expect(Reactor(person).get(['foo', 'bar', 'baz'])).toBe(undefined)
  })
})

describe('reactor.update()', () => {
  test('should return undefined when given an argument that\'s not a string, array, number, boolean, object, or null, or a function that returns a value that\'s not one of those types', () => {
    const person = { name: 'Spencer', age: 25, hobbies: ['programming', 'eating', 'exercise?'] }

    expect(Reactor(person).update(undefined)).toBe(undefined)
    expect(Reactor(person).update(() => undefined)).toBe(undefined)
    expect(Reactor(person).update(new Set())).toBe(undefined)
    expect(Reactor(person).update(() => new Set())).toBe(undefined)
    expect(Reactor(person).update(Error)).toBe(undefined)
    expect(Reactor(person).update(() => Error)).toBe(undefined)
    expect(Reactor(person).update(Infinity)).toBe(undefined)
    expect(Reactor(person).update(() => Infinity)).toBe(undefined)
    expect(Reactor(person).update({ name: 'Spencer', age: 25, hobbies: ['programming', 'eating', new Error()] })).toBe(undefined)
    expect(Reactor(person).update(() => ({ name: 'Spencer', age: 25, hobbies: ['programming', 'eating', new Error()] }))).toBe(undefined)
    console.log(Reactor(person).update({}))
    expect(Reactor(person).update({})).not.toThrow()
    expect(Reactor(person).update(() => ({}))).not.toThrow()
    expect(Reactor(person).update([])).not.toThrow()
    expect(Reactor(person).update(() => [])).not.toThrow()
    expect(Reactor(person).update(9)).not.toThrow()
    expect(Reactor(person).update(() => 9)).not.toThrow()
    expect(Reactor(person).update('foo')).not.toThrow()
    expect(Reactor(person).update(() => 'foo')).not.toThrow()
    expect(Reactor(person).update(false)).not.toThrow()
    expect(Reactor(person).update(() => false)).not.toThrow()
    expect(Reactor(person).update(null)).not.toThrow()
    expect(Reactor(person).update(() => null)).not.toThrow()
    expect(Reactor(person).update({ name: 'Bob', age: 50, hobbies: ['eating', 'sleeping', 'pooping'] })).not.toThrow()
    expect(Reactor(person).update(() => ({ name: 'Bob', age: 50, hobbies: ['eating', 'sleeping', 'pooping'] }))).not.toThrow()
  })

  test('should update the internal value of the reactive item, returning that updated value for reactor.get(path) and reactor.valueOf()', () => {
    const person = { name: 'Spencer', age: 25, hobbies: ['programming', 'eating', 'exercise?'] }
    const reactivePerson = Reactor(person)
    expect(reactivePerson.get('name').valueOf()).toBe('Spencer')
    reactivePerson.update(p => ({ ...p, name: 'George' }))
    expect(reactivePerson.get('name').valueOf()).toBe('George')
    expect(reactivePerson.get(['hobbies', 0]).valueOf()).toBe('programming')
  })
})
