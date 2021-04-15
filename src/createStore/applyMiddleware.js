import { compose } from '@app/utils'

// Enhancer :: StoreCreator -> (Reducer, State) -> Store

// applyMiddleware :: (...Middleware) -> Enhancer
export default function applyMiddleware(...middlewares) {
  return createStore => (reducer, preloadedState) => {
    const store = createStore(reducer, preloadedState)

    let dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this dispatch.'
      )
    }

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args),
    }

    const chain = middlewares.map(middleware => middleware(middlewareAPI))

    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch,
    }
  }
}
