import { newDefaultScheduler } from '@most/scheduler'
import {
  constant,
  debounce,
  filter,
  loop,
  map,
  mergeArray,
  runEffects,
  scan,
  skip,
  skipRepeatsWith,
  snapshot,
  switchLatest,
  take,
  tap,
} from '@most/core'
import { createAdapter } from '@most/adapter'
import { domEvent } from '@most/dom-event'
import { hold } from '@most/hold'
import { compose, composeB1, flip } from '@app/utils'

export {
  constant,
  debounce,
  filter,
  hold,
  map,
  mergeArray,
  scan,
  snapshot,
  switchLatest,
  tap,
}

export { fromObservable } from './fromObservable'

// scheduler :: MostDefaultScheduler
export const scheduler = newDefaultScheduler()

// runStream :: Stream s -> Promise Void
export const runStream = flip(runEffects, scheduler)

// observe :: Function -> Stream a -> Promise Void
export const observe = composeB1(runStream, tap)

// createValueGetter :: Stream a -> () -> a
export const createValueGetter = stream => {
  let value
  observe(v => { value = v }, skipRepeats(hold(stream)))
  return () => value
}

// first :: Stream a -> Stream a
export const first = take(1)

// skipRepeats :: Stream a -> Stream a
export const skipRepeats = skipRepeatsWith(Object.is)

// pairwise :: Stream a -> Stream ( a, a )
export const pairwise = compose(
  skip(1),
  loop((prev, curr) => ({ seed: curr, value: [ prev, curr ] }), undefined)
 )


// ready :: () -> Stream (Event DOMContentLoaded)
export const ready = compose(first, () => domEvent('DOMContentLoaded', window))

// createSubject :: () -> Stream a & { next :: a -> Void }
export const createSubject = () => {
  const [ next, subject ] = createAdapter()
  return Object.assign(subject, { next })
}

// createListenerSource :: ((a -> Void) -> Void) -> Stream a
export const createListenerSource = listenable => {
  const [ next, subject ] = createAdapter()
  listenable(next)
  return subject
}

// fromObservable :: Observable a -> Stream a
// export const fromObservable = a => {
//   if (!isObservable(a)) {
//     throw TypeError('fromObserver: Observable required for the first argument.')
//   }
//   const [ next, source$ ] = createAdapter()
//   const observable = a[$$observable]()
//   observable.subscribe({ next })
//   return source$
// }
