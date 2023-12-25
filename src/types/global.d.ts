/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable no-var */

declare const IS_DEV: boolean
declare const IS_FIREFOX_ENV: boolean
// use var to make it show up in the globalThis type

// Chrome Extension
declare var chrome: typeof import('webextension-polyfill') | undefined

// Firefox Extension
// Auto Import from webextension-polyfill
declare var browser: typeof import('webextension-polyfill')

// Firefox only https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts#exportfunction
declare var exportFunction:
  | ((
      func: () => unknown,
      targetScope: unknown,
      options?: {
        defineAs?: string
        allowCrossOriginArguments?: boolean
      }
    ) => unknown)
  | undefined

// Firefox only https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts#cloneinto
declare var cloneInto:
  | ((
      data: unknown,
      targetScope: unknown,
      options?: { cloneFunctions?: boolean }
    ) => void)
  | undefined

// Polyfill for Promise.withResolvers
interface PromiseConstructor {
  // TODO: remove when lib.d.ts is updated
  // https://github.com/microsoft/TypeScript/issues/56483
  withResolvers<T = unknown>(): {
    promise: Promise<T>
    resolve: (value: T) => void
    reject: (reason?: unknown) => void
  }
}
