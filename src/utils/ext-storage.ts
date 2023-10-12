import { ignorableWatch } from '@vueuse/core'
import { useSubscription } from '@vueuse/rxjs'
import { cloneDeep } from 'lodash-es'
import { filter, fromEventPattern, map, share } from 'rxjs'


export const WEBEXT_STORAGE_UPDATE_KEY = '__webext_storage_update_key__'

type ChangesType = Partial<Record<string, { oldValue?: unknown; newValue?: unknown }>>

export const storageLocalChanged$ = fromEventPattern<ChangesType>(
  handler => browser.storage.local.onChanged.addListener(handler),
  handler => browser.storage.local.onChanged.removeListener(handler)
).pipe(
  share({ resetOnRefCountZero: true })
)

// ignore updates from self
const ignoreSet = new Set<string>()

export const changedFromOthers$ = storageLocalChanged$.pipe(
  filter(change => {
    if (!Object.hasOwn(change, WEBEXT_STORAGE_UPDATE_KEY)) return true

    const id = change[WEBEXT_STORAGE_UPDATE_KEY]?.newValue

    if (typeof id !== 'string') return true

    if (ignoreSet.has(id)) {
      ignoreSet.delete(id)
      return false
    }

    return true
  }),
  share({ resetOnRefCountZero: true })
)


type StorageRefOptions<T> = {
  key: string
  beforeSet?: (value: T) => unknown
  beforeGet?: (value: unknown) => T
}


export function useExtStorageRef<T>(value: T, options: StorageRefOptions<T>) {
  const defaultValue = cloneDeep(value)
  const state = ref(value) as Ref<T>
  const key = options.key
  const beforeGet = options.beforeGet ?? (v => v as T)
  const beforeSet = options.beforeSet ?? (v => v)

  // update stroage.local when state.value changed
  const { ignoreUpdates } = ignorableWatch(state, (newVal, oldVal) => {
    const newLocalVal = beforeSet(newVal)

    const id = ulid()
    ignoreSet.add(id)

    browser.storage.local.set({
      // proxy is not serializable
      [key]: isReactive(newLocalVal) ? cloneDeep(newLocalVal) : newLocalVal,
      [WEBEXT_STORAGE_UPDATE_KEY]: id
    })
  }, {
    deep: true
  })

  // update from others
  useSubscription(
    changedFromOthers$
      .pipe(
        filter(change => Object.hasOwn(change, options.key)),
        map(change => change[options.key]!),
      )
      .subscribe(change => {
        if (Object.hasOwn(change, 'newValue')) {
          const newVal = beforeGet(change.newValue)
          ignoreUpdates(() => {
            state.value = newVal
          })
        } else {
          ignoreUpdates(() => {
            state.value = defaultValue
          })
        }
      })
  )

  // init state
  browser.storage.local.get(key).then(result => {
    if (Object.hasOwn(result, key)) {
      const newVal = beforeGet(result[key])
      ignoreUpdates(() => {
        state.value = newVal
      })
    } else {
      ignoreUpdates(() => {
        state.value = defaultValue
      })
    }
  })

  return state
}


