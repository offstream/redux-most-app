import createStore from '@app/createStore'
import {
  createEpicMiddleware,
  createStateStreamEnhancer,
} from '@app/createStore/redux-most'
import { compose } from '@app/utils'

import rootReducer from './reducer'
import rootEpic from './epic'

const initialState = {
  count: 0,
  title: 'Counter App',
  subtitle: 'Using @most/core + lit-html',
}

const createEpicEhancer = compose(createStateStreamEnhancer, createEpicMiddleware)

export default createStore(
  rootReducer,
  initialState,
  createEpicEhancer(rootEpic)
)
