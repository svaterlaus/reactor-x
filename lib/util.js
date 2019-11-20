const isObject = input => {
  if (input === null || typeof input !== 'object') {
    return false
  }
  return Object.getPrototypeOf(input) === Object.prototype
}

const withPrototype = (target, prototype) => {
  if (!isObject(target)) {
    throw new Error('withPrototype() target input must be a plain object')
  }
  if (typeof prototype !== 'object') {
    throw new Error('withPrototype() prototype input must be null or a plain object')
  }
  const copy = { ...target }
  Object.setPrototypeOf(copy, prototype)
  return copy
}

const log = input => {
  console.log(input.toString())
}

module.exports = {
  withPrototype,
  isObject,
  log
}
