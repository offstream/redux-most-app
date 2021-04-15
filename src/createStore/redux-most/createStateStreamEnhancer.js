import { fromObservable, hold, skipRepeats } from '@app/streams'
import { STATE_STREAM_SYMBOL } from './constants'

// Enhancer :: StoreCreator -> (Reducer, State) -> Store

// createStateStreamEnhancer :: Middleware -> Enhancer
export const createStateStreamEnhancer = epicMiddleware =>
  createStore => (reducer, preloadedState) => {
    const store = createStore(reducer, preloadedState)

    const state$ = skipRepeats(
      store[STATE_STREAM_SYMBOL] || hold(fromObservable(store))
    )

    let dispatch = store.dispatch

    const middlewareApi = {
      getState: store.getState,
      dispatch: action => dispatch(action),
      [STATE_STREAM_SYMBOL]: state$,
    }

    dispatch = epicMiddleware(middlewareApi)(store.dispatch)

    return { ...store, dispatch }
  }
