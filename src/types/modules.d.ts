// import type { ProtocolWithReturn } from 'webext-bridge'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $app: {
      context: string
    }
  }
}

// declare module 'webext-bridge' {
//   export interface ProtocolMap {
//     // define message protocol types
//     // see https://github.com/antfu/webext-bridge#type-safe-protocols
//     'tab-prev': { title: string | undefined }
//     'get-current-tab': ProtocolWithReturn<{ tabId: number }, { title?: string | undefined }>
//   }
// }

// https://stackoverflow.com/a/64189046/479957
export { }

