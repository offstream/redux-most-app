import { mergeArray } from '@app/streams'

// isStream :: a -> Boolean
const isStream = x => typeof x === 'object' && typeof x.run === 'function'

// Epic :: (Stream Action, Stream State) -> Stream Action

// // combineEpics :: [ Epic ] -> Epic
// export const combineEpics = epics =>
//   (action$, state$) =>
//     mergeArray(map(
//       applyAllTo([ action$, state$ ]),
//       epics
//     ))

// combineEpics :: [ Epic ] -> Epic
export const combineEpics =
  epics => (actionStream, middlewareApiOrStateStream) => {
  if (!epics || !Array.isArray(epics)) {
    throw new TypeError('combineEpics: Array required for the first arg.')
  }

  if (epics.length < 1) {
    throw new TypeError(
      'combineEpics: Array of at least one Epic reqired for the first arg.'
    )
  }

  const callEpic = epic => {
    if (typeof epic !== 'function') {
      throw new TypeError(
        'combineEpics: Array of only Epics required for the first arg.'
      )
    }
    const out = epic(actionStream, middlewareApiOrStateStream)

    if (!isStream(out)) {
      const epicIdentifier = epic.name
        ? `named ${epic.name}`
        : `at index ${epics.indexOf(epic)} of the passed array`

      throw new TypeError(
        // eslint-disable-next-line max-len
        `combineEpics: All Epics in the array provided must return a stream. Check the return value of the Epic ${epicIdentifier}.`
      )
    }

    return out
  }

  return mergeArray(epics.map(callEpic))
}
