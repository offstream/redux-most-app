import { createSubject, map, observe, switchLatest } from '@app/streams'
import { applyAllTo, isFunction } from '@app/utils'
import { epicEnd } from './actions'
import { STATE_STREAM_SYMBOL } from './constants'

// Epic :: (Stream Action, Stream State) -> Stream Action

// createEpicMiddleware :: Epic -> ...
export const createEpicMiddleware = epic => {
  if (!isFunction(epic)) {
    throw new TypeError(
      'createEpicMiddleware: Epic (a function) reqiured for the first arg.'
    )
  }

  // actionsIn$ :: Stream Action
  const actionsIn$ = createSubject()
  // epic$ :: Stream Epic
  const epic$ = createSubject()

  let middlewareApi

  const epicMiddleware = _middlewareApi => {
    middlewareApi = _middlewareApi

    return next => {
      // callNextEpic :: Epic -> Stream Action
      const callNextEpic = applyAllTo([
        actionsIn$,
        middlewareApi[STATE_STREAM_SYMBOL] || middlewareApi,
      ])

      // actionsOut$ :: Stream Action
      const actionsOut$ = switchLatest(map(callNextEpic, epic$))
      observe(middlewareApi.dispatch, actionsOut$)

      // emit combined epics
      epic$.next(epic)

      return action => {
        // allow reducers to receive actions before epics
        const result = next(action)
        // call epics with the action
        actionsIn$.next(action)
        return result
      }
    }

  }

  // can be used for hot reloading, code splitting, etc.
  epicMiddleware.replaceEpic = nextEpic => {
    middlewareApi.dispatch(epicEnd())
    epic$.next(nextEpic)
  }

  return epicMiddleware
}
