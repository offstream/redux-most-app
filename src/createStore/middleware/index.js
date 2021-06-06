import {
  // combinators
  B, C,
  // pointfree
  map,
  // predicates
  eachSatisfy, includes, propSatisfies, satisfiesAll,
  isAsync, isFunction, isFunctor, isIterable, isObject, isString,
} from '@app/utils'

// isValidFSAKey :: a -> Boolean
const isValidFSAKey = C(includes, [ 'type', 'payload', 'error', 'meta' ])

// isFSA :: a -> Boolean
const isFSA = satisfiesAll([
  isObject,
  propSatisfies('type', isString),
  B(eachSatisfy(isValidFSAKey), Object.keys),
])

export function multiMiddleware({ dispatch }) {
  return next => action => {
    isIterable(action) ? action.forEach(dispatch) : next(action)
  }
}

export function functorMiddleware({ dispatch }) {
  return next => action => {
    isFunctor(action) ? map(dispatch, action) : next(action)
  }
}

export function createIoMiddleware(name) {
  const isIO = x => isFunction(x[name])
  const runIO = m => m[name]()
  return ({ dispatch }) => next => action => {
    isIO(action)
      ? dispatch(runIO(action))
      : isFSA(action) && isIO(action.payload)
      ? dispatch({ ...action, payload: runIO(action.payload) })
      : next(action)
  }
}

export const ASYNC_ERROR = 'asyncMiddleware/ASYNC_ERROR'

export const asyncErrAction = payload => ({
  type: ASYNC_ERROR,
  payload,
  error: true,
})

export function asyncMiddleware({ dispatch }) {
  return next => action => {
    const errHandler = err =>
      isString(err.type) ? dispatch({ ...err, error: true })
                         : next(asyncErrAction(err))
    isAsync(action)
      ? action.fork(errHandler, dispatch)
      : isFSA(action) && isAsync(action.payload)
      ? action.payload.fork(
          err => dispatch({ ...action, payload: err, error: true }),
          payload => dispatch({ ...action, payload })
        )
      : next(action)
  }
}

export function createWhenMiddleware(pred, then) {
  return middlewareApi => next => action => {
    pred(action) ? then(middlewareApi)(next)(action) : next(action)
  }
}

export function createThunkMiddleware(extraArg) {
  return createWhenMiddleware(
    isFunction,
    ({ dispatch, getState }) => _ => action => {
      action(dispatch, getState, extraArg)
    }
  )
}

export const THUNK_ERROR = 'asyncMiddleware/THUNK_ERROR'

export const thunkErrAction = payload => ({
  type: THUNK_ERROR,
  payload,
  error: true,
})

export function safeThunkMiddleware({ dispatch, getState }) {
  return next => action => {
    const tryThunk = thunk => {
      try {
        thunk(dispatch, getState)
      } catch (e) {
        next(thunkErrAction(e))
      }
    }
    isFunction(action)
      ? tryThunk(action)
      : isFSA(action) && isFunction(action.payload)
      ? tryThunk(action.payload)
      : next(action)
  }
}

export const loggerMiddleware = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  const result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}
