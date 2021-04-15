import compose from 'crocks/helpers/compose'
import curry from 'crocks/helpers/curry'
import flip from 'crocks/combinators/flip'
import isFunction from 'crocks/predicates/isFunction'
import isObject from 'crocks/predicates/isObject'
import pipe from 'crocks/helpers/pipe'

export {
  compose,
  curry,
  flip,
  isFunction,
  isObject,
}

export const nullary = f => () => f()

export const piped = curry((x, fns) => pipe(...fns)(x))

export const composeB1 = curry((f, g, x, y) => f(g(x, y)))

export const applyAllTo = curry((args, fn) => fn(...args))

export const $$observable = (() =>
  (typeof Symbol === 'function' && Symbol.observable) || '@@observable')()

export const isObservable =
  a => a && typeof a === 'object' && isFunction(a[$$observable])
