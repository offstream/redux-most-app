// [NOTE] This is not a complete integration of the redux-middleware-extension API
// This currently allows the following:
//   - monitoring of actions and state
//   - timetraveling
//   - reseting the state
//   - "commit"
// Also note that this Redux Store Enhancer MUST execute first if composing enhacers

const IS_DEV_ENV = (function() {
  try {
    // if using dot env
    return process.env.NODE_ENV === 'development'
  // eslint-disable-next-line no-empty
  } catch {}
  try {
    // if using snowpack
    return import.meta.env.MODE === 'development'
  // eslint-disable-next-line no-empty
  } catch {}
  return false
}())

const IN_BROWSER = (function() {
  return typeof window !== 'undefined'
}())

const WITH_REDUX_DEVTOOLS = (function() {
  return IS_DEV_ENV && IN_BROWSER
      && (window.__REDUX_DEVTOOLS_EXTENSION__
      || window.top?.__REDUX_DEVTOOLS_EXTENSION__)
}())

const REDUX_DEVTOOLS_EXTENSION = (function() {
  if (!WITH_REDUX_DEVTOOLS) return
  try {
    return window.__REDUX_DEVTOOLS_EXTENSION__
        || window.top?.__REDUX_DEVTOOLS_EXTENSION__
  } catch {
    return
  }
}())

const REPLACE_STATE = '@@devtools/REPLACE_STATE'
const replaceState = state => ({
  type: REPLACE_STATE,
  payload: state,
})

export default function devtoolEnhancer(config = {}) {
  const extension = REDUX_DEVTOOLS_EXTENSION

  if (!extension) {
    if (IS_DEV_ENV && IN_BROWSER) {
      console.warn('Please install/enable Redux devtools extension')
    }
    return x => x
  }

  const devtools = extension.connect(config)
  return createStore => (reducer, preloadedState) => {
    const extendedReducer = (state, action) => {
      if (action.type === REPLACE_STATE) {
        return action.payload
      }
      return reducer(state, action)
    }
    const store = createStore(extendedReducer, preloadedState)
    const origDispatch = store.dispatch
    const dispatch = action => {
      const res = origDispatch(action)
      if (action.type !== REPLACE_STATE) {
        devtools.send(action, store.getState())
      }
      return res
    }
    devtools.subscribe(message => {
      console.log('DEVTOOLS', message)
      if (message.type === 'DISPATCH') {
        if (message.payload?.type === 'COMMIT') {
          devtools.init(store.getState())
        } else if (message.payload?.type === 'RESET') {
          // RESET STATE
          devtools.init(preloadedState)
          dispatch(replaceState(preloadedState))
        } else if (
          message.state &&
          message.payload &&
          (message.payload.type === 'JUMP_TO_ACTION'
          || message.payload.type === 'JUMP_TO_STATE')) {
          // timetraveling, REPLACE STATE
          dispatch(replaceState(JSON.parse(message.state)))
        }
      }
    })
    devtools.init(preloadedState)

    return {
      ...store,
      dispatch,
    }
  }
}
