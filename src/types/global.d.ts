/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable no-var */
/// <reference types="vite/client" />

declare const __DEV__: boolean
declare const __NAME__: string
// use var to make it show up in the globalThis type
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