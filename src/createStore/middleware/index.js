const FLNAMES = { map: 'fantasy-land/map' }

const isFunction = x => typeof x === 'function'
const isIterable = x => isFunction(x[Symbol.iterator])
const isFunctor = x => isFunction(x[FLNAMES.map]) || isFunction(x.map)
const isAsync = x => isFunction(x.fork)

const dot = (f, g) => x => f(g(x))
const map = f => x => x[FLNAMES.map] ? x[FLNAMES.map](f) : x.map(f)

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
  return ({ dispatch }) => next => action => {
    isIO(action) ? dispatch(action[name]()) : next(action)
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
    isAsync(action)
    ? action.fork(dot(next, asyncErrAction), dispatch)
    : next(action)
  }
}

export function createWhenMiddleware(pred, then) {
  return middlewareApi => next => action => {
    pred(action) ? then(middlewareApi)(next)(action) : next(action)
  }
}

export function createThunkMiddlleware(extraArg) {
  return createWhenMiddleware(
    isFunction,
    ({ dispatch, getState }) => _ => action => {
      action(dispatch, getState, extraArg)
    }
  )
}

export const loggerMiddleware = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  const result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}
