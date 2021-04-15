import { html, render } from './framework'
import store from './store'
import { map, skipRepeats } from './streams'

import './styles.css'

// App :: AppState -> TemplateResult
const App =  state => html`
  <pre>${JSON.stringify(state, null, 2)}</pre>
  <button @click=${() => dispatch({ type: 'INC' })}>INC</button>
  <button @click=${() => dispatch({ type: 'DEC' })}>DEC</button>
`

const { state$, dispatch, onChange } = store

// dispatch({ type: 'INC' })

// vTree$ :: Stream TemplateResult
const vTree$ = map(App, skipRepeats(state$))

// call action to have store emit the state
// init :: () -> Void
const initStore = () => dispatch({ type: 'INIT' })

// this will also kickstart the store streams
render(initStore, vTree$, document.getElementById('root'))

onChange((curr, prev) => console.log('FIRST', `${prev} -> ${curr}`), s => s.count)
onChange((curr, prev) => console.log('SECOND', `${prev} -> ${curr}`), s => s.count)
