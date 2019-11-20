const fc = require('fast-check')

const object = require('./object')
const number = require('./number')
const string = require('./string')
const boolean = require('./boolean')
const array = require('./array')
const { isReactive } = require('../lib/util')

describe('Object Reactor', () => {
  describe('object()', () => {
    test('should throw an error when given an input other than a plain JS object or a reactive object', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.integer(),
          fc.float(),
          fc.boolean(),
          (str, int, float, bool) => {
            expect(() => object()).toThrow(Error)
            expect(() => object(null)).toThrow(Error)
            expect(() => object([])).toThrow(Error)
            expect(() => object(int)).toThrow(Error)
            expect(() => object(float)).toThrow(Error)
            expect(() => object(str)).toThrow(Error)
            expect(() => object(bool)).toThrow(Error)
            expect(() => object(number(int))).toThrow(Error)
            expect(() => object(string(str))).toThrow(Error)
            expect(() => object(boolean(bool))).toThrow(Error)
            expect(() => object(array([]))).toThrow(Error)
            expect(() => object({})).not.toThrow()
            expect(() => object(object({}))).not.toThrow()
          }
        )
      )
    })
    test('should return a reactive object when given either a plain JS object or reactive object as input', () => {
      expect(isReactive(object({}))).toBe(true)
      expect(isReactive(object(object({})))).toBe(true)
    })
    test('should return the same result no matter how many times its input is wrapped in an object reactor', () => {
      expect(object({})).toEqual(object(object({})))
      expect(object({})).toEqual(object(object(object({}))))
      expect(object({})).toEqual(object(object(object(object({})))))
    })
    test('should throw an error when given an object input with properties that are not reactive', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.integer(),
          fc.float(),
          fc.boolean(),
          (str, int, float, bool) => {
            expect(() => object({ string: str })).toThrow(Error)
            expect(() => object({ integer: int })).toThrow(Error)
            expect(() => object({ float: float })).toThrow(Error)
            expect(() => object({ boolean: bool })).toThrow(Error)
            expect(() => object({ array: [] })).toThrow(Error)
            expect(() => object({ object: {} })).toThrow(Error)

            expect(() => object({ string: string(str) })).not.toThrow()
            expect(() => object({ integer: number(int) })).not.toThrow()
            expect(() => object({ float: number(float) })).not.toThrow()
            expect(() => object({ boolean: boolean(bool) })).not.toThrow()
            expect(() => object({ array: array([]) })).not.toThrow()
            expect(() => object({ object: object({}) })).not.toThrow()
          }
        )
      )
    })
  })

  // describe('.subscribe()', () => {
  //   test('should throw an error', () => {

  //   })
  // })
})
