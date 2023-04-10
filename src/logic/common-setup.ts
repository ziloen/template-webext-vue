import type { App } from 'vue'
import { RuntimeContext } from 'webext-bridge'
import browser, { Manifest } from 'webextension-polyfill'

export const hasAPI = (nsps: keyof typeof browser): boolean => browser[nsps] as unknown as boolean

export const getBackgroundPageType = () => {
  const manifest: Manifest.WebExtensionManifest = browser.runtime.getManifest()

  if (typeof window === 'undefined') return 'background'

  const popupPage = manifest.browser_action?.default_popup ?? manifest.action?.default_popup
  if (popupPage) {
    const url = new URL(browser.runtime.getURL(popupPage))
    if (url.pathname === window.location.pathname) return 'popup'
  }

  if (manifest.options_ui?.page) {
    const url = new URL(browser.runtime.getURL(manifest.options_ui.page))
    if (url.pathname === window.location.pathname) return 'options'
  }

  return 'background'
}

export const context: RuntimeContext | null
  = hasAPI('devtools')
    ? 'devtools'
    : hasAPI('tabs')
      ? getBackgroundPageType()
      : hasAPI('extension')
        ? 'content-script'
        : typeof document !== 'undefined'
          ? 'window'
          : null

export function setupApp(app: App) {
  // const context = getCurrentContext()
  const context: RuntimeContext = 'background'

  // Inject a globally available `$app` object in template
  app.config.globalProperties.$app = { context }

  // Provide access to `app` in script setup with `const app = inject('app')`
  app.provide('app', app.config.globalProperties.$app)

  // Here you can install additional plugins for all contexts: popup, options page and content-script.
  // example: app.use(i18n)
  // example excluding content-script context: if (context !== 'content-script') app.use(i18n)
}
