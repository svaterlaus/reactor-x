# Reactor-X

Reactor-X is a JavaScript library for intuitive, reactive state management. Define your state with any object structure, instantiate it as a reactor, and subscribe to state updates at any level.

Want to use observables? Wrap any reactor with `observableFrom(reactor)` for easy integration with RxJS.

## Installation

```bash
npm install @crocodile/reactor-x
# or
yarn add @crocodile/reactor-x
```

## Usage

A reactor is a special data type that holds on to a piece of state. When that state is updated, the reactor notifies all of its subscribers (if it has any) of the new state.

```javascript
const { Reactor } = require('reactor-x')

const nameReactor = Reactor('Spencer')

nameReactor.subscribe(name => {
  console.log(`My name is ${name}!`)
})
// My name is Spencer!

nameReactor.update('Spencer Vaterlaus')
// My name is Spencer Vaterlaus!
```

Reactors with object states are treated as recursive tree structures. In other words, when you initialize your reactor with an object, not only do you get an object reactor, but every property becomes its own reactor that can be individually subscribed to and updated.

```javascript
const { Reactor } = require('reactor-x')

const userReactor = Reactor({
  username: 'spencer-vaterlaus',
  social: {
    facebook: null,
    linkedIn: null,
    github: 'github.com/svaterlaus'
  }
})

const linkedInReactor = userReactor.get(['social', 'linkedIn'])

linkedInReactor.subscribe(url => {
  console.log(`You can reach me at ${url}`)
})
// You can reach me at null

linkedInReactor.update('linkedin.com/in/spencervaterlaus')
// You can reach me at linkedin.com/in/spencervaterlaus

const user = userReactor.valueOf()
console.log('The value of the userReactor is now updated:\n', user)
/*
'The value of the userReactor is now updated:
  { username: 'spencer-vaterlaus',
    social:
      { facebook: null,
      linkedIn: 'linkedin.com/in/spencervaterlaus',
      github: 'github.com/svaterlaus' } }
*/
```

When a child reactor is updated, it notifies not only its own subscribers, but the subscribers of all of its parent reactors. It will also notify its children reactors, but only the ones whose values were affected by the update. In this way, update notifications always begin with the leaves of the tree and bubble up to the root.

```javascript
const { Reactor } = require('reactor-x')

const rootReactor = Reactor({
  parent: {
    firstChild: true,
    secondChild: false
  }
})
const parentReactor = rootReactor.get('parent')
const firstChildReactor = parentReactor.get('firstChild')
const secondChildReactor = parentReactor.get('secondChild')

rootReactor.subscribe(update => {
  console.log('ROOT: ', update)
})
// ROOT: { parent: { firstChild: true, secondChild: false } }

parentReactor.subscribe(update => {
  console.log('PARENT: ', update)
})
// PARENT: { firstChild: true, secondChild: false }

firstChildReactor.subscribe(update => {
  console.log('FIRST_CHILD: ', update)
})
// FIRST_CHILD: true

secondChildReactor.subscribe(update => {
  console.log('SECOND_CHILD: ', update)
})
// SECOND_CHILD: false

firstChildReactor.update(false)
// FIRST_CHILD: false
// PARENT: { firstChild: false, secondChild: false }
// ROOT: { parent: { firstChild: false, secondChild: false } }

rootReactor.update(prev => ({ parent: { ...prev, secondChild: true }}))
// SECOND_CHILD: true
// PARENT: { firstChild: false, secondChild: true }
// ROOT: { parent: { firstChild: false, secondChild: true } }
```

`reactor.update(transform)` accepts either a non-function value for reasignment, or a function that takes the current state as an argument. Using a function argument allows for derived updates based on the current state. Given an object argument, it will only update the included keys on that object, leaving the rest alone.

```javascript
const { Reactor } = require('reactor-x')

const personReactor = Reactor({
  name: 'Spencer',
  age: 25
})

personReactor.subscribe(console.log)
// { name: 'Spencer', age: 25 }

personReactor.update({ name: 'Spencer Vaterlaus' })
// { name: 'Spencer Vaterlaus', age: 25 }

personReactor.update(person => ({ age: person.age + 1 }))
// { name: 'Spencer Vaterlaus', age: 26 }
```

The structure of an object reactor is immutable. The property values can be updated, but properties cannot be added or removed. An invalid update will not throw an error, but instead will return the current, unchanged state.

```javascript
const { Reactor } = require('reactor-x')

const fooBarReactor = Reactor({ foo: 'bar' })

console.log(
  fooBarReactor.update(null)
)
// { foo: 'bar' }

console.log(
  fooBarReactor.update({ bar: 'baz' })
)
// { foo: 'bar' }

console.log(
  fooBarReactor.update({ foo: 'not bar' })
)
// { foo: 'not bar' }
```

Invoking `reactor.subscribe(callback)` returns an unsubscribe function that when invoked will prevent the provided callback from being called by any more updates.

```javascript
const { Reactor } = require('reactor-x')

const messageReactor = Reactor('This will log on subscription')

const messageUnsubscribe = messageReactor.subscribe(console.log)
// This will log on subscription

messageUnsubscribe()

messageReactor.update('This won\'t log now')
```

Reactor-X includes `observerableFrom(reactor)`, a helper function for creating observables from reactors. This returns an RxJS observable that can be used as you'd expect (subscribe, unsubscribe, use operators, etc.)

```javascript
const { Reactor, fromObservable } = require('reactor-x')
const { filter } = require('rxjs/operators')

const isNotEmpty = withLength => withLength.length > 0

const userReactor = Reactor({
  username: 'spencer-vaterlaus',
  hobbies: []
})

const hobbiesReactor = userReactor.get('hobbies')

const subscription = observableFrom(hobbiesReactor)
  .pipe(filter(isNotEmpty))
  .subscribe(hobbies => {
    console.log('I enjoy', hobbies.join(', '))
  })
  
hobbiesReactor.update(['eating', 'sleeping'])
// I enjoy eating, sleeping

hobbiesReactor.update(hobbies => [...hobbies, 'programming'])
// I enjoy eating, sleeping, programming

subscription.unsubscribe()
```

## Contributing

Before making a pull request, please submit an issue describing the need for the PR. PRs should be made on `develop` branch, not on `master`.

More contributing guidelines will be put in place as necessary.

## TODO

- [ ] Create example projects integrating Reactor-X with popular frontend frameworks *(React, Angular)*
- [ ] Add badges for build status and test coverage *(other badges?)*
