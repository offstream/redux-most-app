import {
  combineEpics,
  select,
  selectArray,
  withState,
} from '@app/createStore/redux-most'
import { constant, debounce, filter } from '@app/streams'
import { flip, pipe } from '@app/utils'

const watchINC = pipe(
  select('INC'),
  debounce(500),
  constant(() => console.log('INCREASED!'))
)

const watchDEC = pipe(
  select('DEC'),
  debounce(500),
  constant(() => console.log('DECREASED!'))
)

const fizz = flip(state$ => pipe(
  selectArray([ 'INC', 'DEC' ]),
  withState(state$),
  filter(([ state, _ ]) => state.count % 3 === 0),
  constant({ type: 'LOG', payload: 'FIZZ' })
))

const buzz = flip(state$ => pipe(
  selectArray([ 'INC', 'DEC' ]),
  withState(state$),
  filter(([ state, _ ]) => state.count % 5 === 0),
  constant({ type: 'LOG', payload: 'BUZZ' })
))

export default combineEpics([
  watchINC,
  watchDEC,
  fizz,
  buzz,
])
