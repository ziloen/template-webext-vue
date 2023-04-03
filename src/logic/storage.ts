import { useSubscription } from '@vueuse/rxjs'
import { fromEventPattern, share } from 'rxjs'
import { Storage as ExtensionStorage } from 'webextension-polyfill'
import { useStorageLocal } from '~/composables/useStorageLocal'



export const storageDemo = useStorageLocal('webext-demo', 'Storage Demo')



/**
 * browser.storage.local.onChanged 事件流
 */
export const $storageLocalChange =
  fromEventPattern<ExtensionStorage.StorageAreaOnChangedChangesType>(
    handler => browser.storage.local.onChanged.addListener(handler),
    handler => browser.storage.local.onChanged.removeListener(handler)
  ).pipe(
    share({ resetOnRefCountZero: true })
  )



/**
 * 监听 browser.storage.local 的变化
 * @param key 要监听的 key
 * @param onChange 变化时的回调
 * @example
 * ```ts
 * useStorageLocalChange('key', ({ newValue, oldValue }) => {
 *   console.log("new value:", newValue)
 *   console.log("old value:", oldValue)
 * })
 * ```
 */
export function useStorageLocalChange(key: string, onChange: (change: ExtensionStorage.StorageChange) => void) {
  useSubscription(
    $storageLocalChange.subscribe(changes => {
      const target = changes[key]
      target && onChange(target)
    })
  )
}