import { combineEpics } from './combineEpics'
import { createEpicMiddleware } from './createEpicMiddleware'
import { createStateStreamEnhancer } from './createStateStreamEnhancer'
import { compose } from '@app/utils'

// Epic :: (Stream Action, Stream State) -> Stream Action

// createEpicEnhancer = [ Epic ] -> Enhancer
export const createEpicEhancer = compose(
  createStateStreamEnhancer,
  createEpicMiddleware,
  combineEpics
)
