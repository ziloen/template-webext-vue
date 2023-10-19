import { ignorableWatch } from '@vueuse/core'
import { useSubscription } from '@vueuse/rxjs'
import { cloneDeep } from 'lodash-es'
import { filter, fromEventPattern, map, share } from 'rxjs'


export const WEBEXT_STORAGE_UPDATE_KEY = '__webext_storage_update_key__'

export type StorageChange = { oldValue?: unknown; newValue?: unknown }
export type ChangesType = Partial<Record<string, StorageChange>>



/**
 * browser.storage.local.onChanged event stream
 */
export const storageLocalChanged$ = fromEventPattern<ChangesType>(
  handler => browser.storage.local.onChanged.addListener(handler),
  handler => browser.storage.local.onChanged.removeListener(handler)
).pipe(
  share({ resetOnRefCountZero: true })
)



type StorageRefOptions<T> = {
  /** storage.local key */
  key: string
  /**
   * change value before set to storage
   */
  beforeSet?: (value: T) => unknown
  /**
   * change value after get from storage
   */
  afterGet?: (value: unknown) => T
}


export function useStorageLocal<T>(value: T, options: StorageRefOptions<T>) {
  const defaultValue = cloneDeep(value)
  const state = ref(value) as Ref<T>
  // storage.local key
  const key = options.key
  // change value after get from storage
  const afterGet = options.afterGet ?? (v => v as T)
  // change value before set to storage
  const beforeSet = options.beforeSet ?? (v => v)
  /** ignore changes from self */
  const ignoreSet = new Set<string>()

  // update stroage.local when state changed
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
    storageLocalChanged$.pipe(
      filter(changes => {
        // if storage key didn't change, ignore
        if (!Object.hasOwn(changes, key)) return false
        // if update key not exist, apply changes
        if (!Object.hasOwn(changes, WEBEXT_STORAGE_UPDATE_KEY)) return true

        const id = changes[WEBEXT_STORAGE_UPDATE_KEY]?.newValue

        if (typeof id !== 'string') return true

        if (ignoreSet.has(id)) {
          ignoreSet.delete(id)
          return false
        }

        return true
      }),
      map(changes => changes[key]!),
    ).subscribe(change => {
      if (Object.hasOwn(change, 'newValue')) {
        const newVal = afterGet(change.newValue)
        ignoreUpdates(() => {
          state.value = newVal
        })
      } else {
        ignoreUpdates(() => {
          state.value = cloneDeep(defaultValue)
        })
      }
    })
  )

  // init state
  browser.storage.local.get(key).then(result => {
    if (Object.hasOwn(result, key)) {
      const newVal = afterGet(result[key])
      ignoreUpdates(() => {
        state.value = newVal
      })
    } else {
      ignoreUpdates(() => {
        state.value = cloneDeep(defaultValue)
      })
    }
  })

  return state
}


/**
 * 
 * @param key storage.local key
 * @param onChange callback
 * @example
 * ```ts
 * useStorageLocalChange('key', ({ newValue, oldValue }) => {
 *   console.log("new value:", newValue)
 *   console.log("old value:", oldValue)
 * })
 * ```
 */
export function useStorageLocalChange(key: string, onChange: (change: StorageChange) => void) {
  useSubscription(
    storageLocalChanged$.subscribe(changes => {
      if (Object.hasOwn(changes, key)) {
        onChange(changes[key]!)
      }
    })
  )
}


