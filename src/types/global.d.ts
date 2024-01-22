/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable no-var */

// Environment Variables
/**
 * Whether the current environment is development
 */
declare const IS_DEV: boolean
/**
 * Whether the current environment is Firefox Extension
 */
declare const IS_FIREFOX_ENV: boolean

/**
 * Chrome Extension API
 *
 */
// declare var chrome: typeof import('webextension-polyfill') | undefined

/**
 * Firefox Extension API when use `globalThis.browser`
 *
 * Auto Import from webextension-polyfill otherwise
 */
declare var browser: typeof import('webextension-polyfill')

/**
 * Exports a function to a different scope
 *
 * Firefox only
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts#exportfunction)
 */
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

/**
 * Clones an object into a different scope
 *
 * Firefox only
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts#cloneinto)
 */
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
