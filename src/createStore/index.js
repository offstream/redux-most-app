import {
  createSubject,
  hold,
  observe,
  pairwise,
  runStream,
  scan,
  scheduler,
  skipRepeats,
} from '@app/streams'
import { $$observable, isObject, nullary, piped } from '@app/utils'
import { STATE_STREAM_SYMBOL } from './redux-most/constants'

export { default as applyMiddleware } from './applyMiddleware'

const create = (reducer, initial) => {
  let state = initial

  // action$ :: Stream Action
  const action$ = createSubject()

  // dispatch :: Action -> Void
  const dispatch = action => {
    if (!isObject(action)) {
      // eslint-disable-next-line max-len
      throw new Error('Actions must be plain objects. You may need to add middleware to your store setup to handle dispatching other values.')
    }
    if (action.type === undefined) {
      // eslint-disable-next-line max-len
      throw new Error('Actions may not have an undefined "type" property. You may have misspelled an action type string constant.')
    }
    return action$.next(action)
  }

  // state$ will emit everytime dispatch is called
  // ...and will emit to the observer the first time it observes
  // state$ :: Stream State
  const state$ = piped(action$, [
    scan((s, a) => (state = reducer(s, a)), initial),
    hold,
  ])

  // getState :: () -> State
  //          :: (State -> a) -> a
  const getState = selector => selector ? selector(state) : state

  // will run callback everytime dispatch is called
  // subscribe :: (() -> Void) -> () -> Void
  const subscribe = callback => {
    const sub$ = action$.run({ event: nullary(callback) }, scheduler)
    // unsubscribe
    return () => sub$.dispose()
  }

  // will emit everytime dispatch is called
  // observable :: () -> Observable State
  const observable = () => ({
    subscribe: observer => {
      if (!isObject(observer)) {
        throw new TypeError('Expected the observer to be an object.')
      }

      const observeState = () => observer.next?.(getState())
      observeState()
      return { unsubscribe: subscribe(observeState) }
    },
    [$$observable]: observable,
  })

  // change$ :: Stream [ State, State ]
  const change$ = piped(state$, [
    skipRepeats,
    pairwise,
  ])

  // will only react to changes in the selected piece of state
  // onSelectedChange :: ( ([ s, s ] -> Void)
  //                     , (State -> s)
  //                     , ? ((s, s) -> Boolean)
  //                     ) -> Promise Void
  const onSelectedChange = (callback, selector, eqFn = Object.is) =>
    observe(states => {
      const [ prev, curr ] = states.map(selector)
      if (!eqFn(curr, prev)) callback(curr, prev)
    }, change$)

  // will only react when the state changes
  // onChange :: ( ([ State, State ] -> Void)
  //             , ? (State -> s)
  //             , ? ((s, s) -> Boolean)
  //             ) -> Promise Void
  const onChange = (calback, selector, eqFn) =>
    (selector || eqFn)
      ? onSelectedChange(calback, selector, eqFn)
      : observe(([ prev, curr ]) => calback(curr, prev), change$)

  // [REVIEW] not sure if this would CAUSE BUGS...
  // done so that the store is immediately active
  // ...meaning you can dipatch without having to observe first
  runStream(change$)

  return {
    dispatch,
    getState,
    subscribe,
    [$$observable]: observable,
    // here begins the extra stuff
    onChange,
    action$,
    state$,
    [STATE_STREAM_SYMBOL]: state$,
    change$,
  }
}

export default (reducer, initial = {}, enhancer) =>
  enhancer ? enhancer(create)(reducer, initial)
           : create(reducer, initial)
