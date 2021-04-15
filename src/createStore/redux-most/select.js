import { filter } from '@app/streams'
import { curry } from '@app/utils'

// select :: a -> Stream b -> Stream b
export const select = curry(
  actionType => filter(({ type }) => type && type === actionType)
)
