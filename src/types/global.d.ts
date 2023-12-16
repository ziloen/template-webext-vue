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

interface PromiseConstructor {
  // TODO: remove when lib.d.ts is updated
  // https://github.com/microsoft/TypeScript/issues/56483
  withResolvers<T = unknown>(): {
    promise: Promise<T>
    resolve: (value: T) => void
    reject: (reason?: unknown) => void
  }
}
