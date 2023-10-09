/// <reference types="vite/client" />

declare const __DEV__: boolean
declare const __NAME__: string

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
