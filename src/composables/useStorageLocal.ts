import type {
  MaybeRef,
  RemovableRef,
  StorageLikeAsync,
  UseStorageAsyncOptions
} from '@vueuse/core'
import {
  useStorageAsync
} from '@vueuse/core'
import { storage } from 'webextension-polyfill'

const storageLocal: StorageLikeAsync = {
  async removeItem(key: string) {
    return storage.local.remove(key)
  },

  async setItem(key: string, value: string) {
    return storage.local.set({ [key]: value })
  },

  async getItem<T = any>(key: string) {
    return (await storage.local.get(key))[key] as T
  }
}

export const useStorageLocal = <T>(
  key: string,
  initialValue: MaybeRef<T>,
  options?: UseStorageAsyncOptions<T>
): RemovableRef<T> => useStorageAsync(key, initialValue, storageLocal, options)
