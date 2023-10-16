/* eslint-disable no-var */
/// <reference types="vite/client" />

declare const __DEV__: boolean
declare const __NAME__: string
// use var to make it show up in the globalThis type
declare var browser: typeof import('webextension-polyfill')