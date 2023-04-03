import { useSubscription } from '@vueuse/rxjs'
import { fromEventPattern, share } from 'rxjs'
import { Storage as ExtensionStorage } from 'webextension-polyfill'
import { useStorageLocal } from '~/composables/useStorageLocal'



export const storageDemo = useStorageLocal('webext-demo', 'Storage Demo')



export const $storageLocalChange =
  fromEventPattern<ExtensionStorage.StorageAreaOnChangedChangesType>(
    handler => browser.storage.local.onChanged.addListener(handler),
    handler => browser.storage.local.onChanged.removeListener(handler)
  ).pipe(
    share({ resetOnRefCountZero: true })
  )



export function useStorageLocalChange(key: string, onChange: (change: ExtensionStorage.StorageChange) => void) {
  useSubscription(
    $storageLocalChange.subscribe(changes => {
      const target = changes[key]
      target && onChange(target)
    })
  )
}