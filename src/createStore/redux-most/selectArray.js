import { filter } from '@app/streams'
import { curry } from '@app/utils'

// selectArray :: a -> Stream b -> Stream b
export const selectArray = curry(
  actionTypes => filter(({ type }) => type && actionTypes.includes(type))
)
