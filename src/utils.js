import All from 'crocks/All'
import Async from 'crocks/Async'
import Maybe from 'crocks/Maybe'
import Pred from 'crocks/Pred'
import applyTo from 'crocks/combinators/applyTo'
import binary from 'crocks/helpers/binary'
import compose from 'crocks/helpers/compose'
import constant from 'crocks/combinators/constant'
import converge from 'crocks/combinators/converge'
import curry from 'crocks/helpers/curry'
import either from 'crocks/pointfree/either'
import equals from 'crocks/pointfree/equals'
import flip from 'crocks/combinators/flip'
import ifElse from 'crocks/logic/ifElse'
import isFunction from 'crocks/predicates/isFunction'
import isFunctor from 'crocks/predicates/isFunctor'
import isObject from 'crocks/predicates/isObject'
import isSameType from 'crocks/core/isSameType'
import isString from 'crocks/predicates/isString'
import map from 'crocks/pointfree/map'
import mreduceMap from 'crocks/helpers/mreduceMap'
import or from 'crocks/logic/or'
import pipe from 'crocks/helpers/pipe'
import propSatisfies from 'crocks/predicates/propSatisfies'
import isArray from 'crocks/core/isArray'

export {
  All,
  applyTo,
  binary,
  compose,
  curry,
  flip,
  isFunction,
  isFunctor,
  isObject,
  isString,
  map,
  pipe,
  propSatisfies,
}

export const apply = curry((f, x) => f(x))

export const dot = curry((f, g, x) => f(g(x)))

export const composeB1 = curry((f, g, x, y) => f(g(x, y)))

export {
  apply as A,
  dot as B,
  composeB1 as B1,
  converge as S2,
  flip as C,
  applyTo as T,
}

// TRUE :: a -> Boolean
const TRUE = constant(true)

// FALSE :: a -> Boolean
const FALSE = constant(false)

export const nullary = f => () => f()

export const piped = curry((x, fns) => pipe(...fns)(x))

export const applyAllTo = curry((args, fn) => fn(...args))

export const $$observable = (() =>
  (typeof Symbol === 'function' && Symbol.observable) || '@@observable')()

export const isObservable =
  a => a && typeof a === 'object' && isFunction(a[$$observable])

// isGeneralObject :: a -> Boolean
export const isGeneralObject = x => x != null && typeof x === 'object'

// isAsync :: a -> Boolean
export const isAsync = or(isSameType(Async), propSatisfies('fork', isFunction))

// isIterable :: a -> Boolean
export const isIterable = x => isGeneralObject(x) && isFunction(x[Symbol.iterator])

// isJust :: a -> Boolean
export const isJust = ifElse(isSameType(Maybe), either(FALSE, TRUE), FALSE)

// includes :: Foldable f => a -> f a -> Boolean
export const includes = curry((x, f) =>
  isArray(f) ? f.includes(x) : isJust(find(equals(x), f))
)

// _runPred :: (a -> Boolean | Pred a) -> a -> Boolean
const _runPred = curry((p, a) =>
  isSameType(Pred, p) ? p.runWith(a) : p(a)
)

// eachSatisfy :: Foldable f => (a -> Boolean | Pred a) -> f a -> Boolean
export const eachSatisfy = curry((pred, f) =>
  isArray(f) ? f.every(_runPred(pred)) : mreduceMap(All, pred, f)
)

// satisfiesAll :: Foldable (a -> Boolean | Pred a) -> a -> Boolean
export const satisfiesAll = curry((preds, x) =>
  mreduceMap(All, applyTo(x), preds)
)
