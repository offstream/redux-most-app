import { $$observable, isFunction, isObservable } from '@app/utils'

// [NOTE] THIS IS A CRUDE PORT of Most's fromObservable to be used with @most/core

const getObservable = a => a[$$observable]()

const tryEvent = (t, x, sink) => {
  try {
    sink.event(t, x)
  } catch (e) {
    sink.error(t, e)
  }
}

const tryEnd = (t, sink) => {
  try {
    sink.end(t)
  } catch (e) {
    sink.error(t, e)
  }
}

// [NOTE] Sadly, we cannot use POJOs to implement Sources

function Disposable(disposeFn) {
  return Object.create(Disposable.prototype, {
    disposeFn: { value: disposeFn },
    disposed: { value: false, writable: true },
  })
}
Object.assign(Disposable.prototype, {
  dipose() {
    if (this.disposed) return
    this.disposed = true
    this.diposeFn()
  },
})

function SubscriberSink(sink, scheduler) {
  return Object.create(SubscriberSink.prototype, {
    sink: { value: sink },
    scheduler: { value: scheduler },
  })
}
Object.assign(SubscriberSink.prototype, {
  next(x) {
    tryEvent(this.scheduler.currentTime(), x, this.sink)
  },
  complete() {
    tryEnd(this.scheduler.currentTime(), this.sink)
  },
  error(e) {
    this.sink.error(this.scheduler.now(), e)
  },
})

function ObservableSource(observable) {
  return Object.create(ObservableSource.prototype, {
    observable: { value: observable },
  })
}
Object.assign(ObservableSource.prototype, {
  run(sink, scheduler) {
    const sub = this.observable.subscribe(SubscriberSink(sink, scheduler))
    if (isFunction(sub)) {
      return Disposable(() => sub())
    } else if (isFunction(sub.unsubscribe)) {
      return Disposable(() => sub.unsubscribe())
    }
    throw new TypeError(
      `Observable returned invalid subscription ${String(sub)}`
    )
  },
})

// fromObservable :: Observable a -> Stream a
export const fromObservable = a => {
  if (!isObservable(a)) {
    throw new TypeError(
      'fromObservable: Observable required for the first arg.'
    )
  }
  return ObservableSource(getObservable(a))
}
