import createStore, { applyMiddleware } from '@app/createStore'
import {
  createEpicMiddleware,
  createStateStreamEnhancer,
} from '@app/createStore/redux-most'
import { compose } from '@app/utils'

import rootReducer from './reducer'
import rootEpic from './epic'
import { createThunkMiddleware } from '@app/createStore/middleware'
import devtoolEnhancer from '@app/createStore/devtools'

const initialState = {
  count: 0,
  title: 'Counter App',
  subtitle: 'Using @most/core + lit-html',
}

const createEpicEhancer = compose(createStateStreamEnhancer, createEpicMiddleware)

export default createStore(
  rootReducer,
  initialState,
  compose(
    createEpicEhancer(rootEpic), // needs to execute AFTER applyMiddleware
    applyMiddleware(createThunkMiddleware()),
    devtoolEnhancer() // needs to execute FIRST
  )
)
