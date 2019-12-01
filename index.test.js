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
  test('should throw an error when given an object or array that has properties, or nested properties, that don\'t directly serialize to JSON', () => {
    console.log(Reactor({ name: 'Spencer', problem: new Error() }))
    expect(() => Reactor({ name: 'Spencer', problem: new Error() })).toThrow(Error)
    expect(() => Reactor(['Spencer', [[[{ veryNested: undefined }]]]])).toThrow(Error)

    expect(() => Reactor({ name: 'Spencer', noProblem: 'TADA' })).not.toThrow()
    expect(() => Reactor({ name: 'Spencer', noNestedProblem: [999] })).not.toThrow()
    expect(() => Reactor(['Spencer', [[[{ veryNested: null }]]]])).not.toThrow()
  })
})

describe('reactor.valueOf()', () => {
  test('should return a value equal to the same argument given to Reactor()', () => {
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
  test('should throw an error when given anything other than an array, string, or number', () => {
    const person = { name: 'Spencer', age: 25, hobbies: ['programming', 'eating', 'exercise?'] }

    expect(() => Reactor(person).get(undefined)).toThrow(Error)
    expect(() => Reactor(person).get(new Date())).toThrow(Error)
    expect(() => Reactor(person).get({ foo: 'bar' })).toThrow(Error)

    expect(() => Reactor(person).get('age')).not.toThrow()
    expect(() => Reactor(person).get(['age'])).not.toThrow()
    expect(() => Reactor(person).get(['hobbies', 1])).not.toThrow()
  })
  test('should return the reactive item at the path argument', () => {
    const person = { name: 'Spencer', age: 25, hobbies: ['programming', 'eating', 'exercise?'] }

    console.log(Reactor(person))
    expect(Reactor(person).get('age')).not.toBe(25)
    expect(Reactor(person).get('age').valueOf()).toBe(25)
    expect(Reactor(person).get(['hobbies', 1])).not.toBe('eating')
    expect(Reactor(person).get(['hobbies', 1]).valueOf()).toBe('eating')
  })
})

describe('reactor.update()', () => {
  test('should throw an error when given an argument that\'s not directly serializable to JSON, or a function argument that returns a value that\'s not directly serializable to JSON', () => {
    const person = { name: 'Spencer', age: 25, hobbies: ['programming', 'eating', 'exercise?'] }

    const reactivePerson = Reactor(person)
    reactivePerson.get('age').subscribe(console.log)
    reactivePerson.update(p => ({ ...p, age: 26 }))

    expect(() => Reactor(person).update(undefined)).toThrow(Error)
    expect(() => Reactor(person).update(() => undefined)).toThrow(Error)
    expect(() => Reactor(person).update(new Set())).toThrow(Error)
    expect(() => Reactor(person).update(() => new Set())).toThrow(Error)
    expect(() => Reactor(person).update(Error)).toThrow(Error)
    expect(() => Reactor(person).update(() => Error)).toThrow(Error)
    expect(() => Reactor(person).update(Infinity)).toThrow(Error)
    expect(() => Reactor(person).update(() => Infinity)).toThrow(Error)
    expect(() => Reactor(person).update({ name: 'Spencer', age: 25, hobbies: ['programming', 'eating', new Error()] })).toThrow(Error)
    expect(() => Reactor(person).update(() => ({ name: 'Spencer', age: 25, hobbies: ['programming', 'eating', new Error()] }))).toThrow(Error)

    expect(() => Reactor(person).update({})).not.toThrow()
    expect(() => Reactor(person).update(() => ({}))).not.toThrow()
    expect(() => Reactor(person).update([])).not.toThrow()
    expect(() => Reactor(person).update(() => [])).not.toThrow()
    expect(() => Reactor(person).update(9)).not.toThrow()
    expect(() => Reactor(person).update(() => 9)).not.toThrow()
    expect(() => Reactor(person).update('foo')).not.toThrow()
    expect(() => Reactor(person).update(() => 'foo')).not.toThrow()
    expect(() => Reactor(person).update(false)).not.toThrow()
    expect(() => Reactor(person).update(() => false)).not.toThrow()
    expect(() => Reactor(person).update(null)).not.toThrow()
    expect(() => Reactor(person).update(() => null)).not.toThrow()
    expect(() => Reactor(person).update({ name: 'Bob', age: 50, hobbies: ['eating', 'sleeping', 'pooping'] })).not.toThrow()
    expect(() => Reactor(person).update(() => ({ name: 'Bob', age: 50, hobbies: ['eating', 'sleeping', 'pooping'] }))).not.toThrow()
  })

  test('should update the internal value of the reactive item, returning that updated value for reactor.get(path) and reactor.valueOf()', () => {
    const person = { name: 'Spencer', age: 25, hobbies: ['programming', 'eating', 'exercise?'] }
    const reactivePerson = Reactor(person)
    expect(reactivePerson.get('name').valueOf()).toBe('Spencer')
    console.log('reactivePerson: ', reactivePerson)
    reactivePerson.update(p => ({ ...p, name: 'George' }))
    console.log('reactivePerson: ', reactivePerson)
    expect(reactivePerson.get('name').valueOf()).toBe('George')
    expect(reactivePerson.get(['hobbies', 0]).valueOf()).toBe('programming')
  })
})
