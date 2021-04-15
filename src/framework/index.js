import { render as renderLit } from 'lit-html'
import { observe, ready, tap } from '@app/streams'
import { binary, flip } from '@app/utils'

// OnReadyCallback :: Event DOMContentLoaded -> Void
// render :: ( onReadyCallback, Stream TemplateResult, DOMNode ) -> Promise Void
export const render = (init, vTree$, mountNode) =>
  observe(
    () => observe(flip(binary(renderLit), mountNode), vTree$),
    tap(init, ready())
  )

export { html } from 'lit-html'
