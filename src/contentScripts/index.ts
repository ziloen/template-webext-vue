/* eslint-disable no-console */
import { createApp } from 'vue'
import { onMessage } from 'webext-bridge'
import { setupApp } from '~/logic/common-setup'
import App from './views/App.vue'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[vitesse-webext] Hello world from content script')

  // communication example: send previous tab title from background page
  onMessage('tab-prev', ({ data }) => {
    console.log(`[vitesse-webext] Navigate from page "${data.title ?? ''}"`)
  })

  // mount component to context window
  const container = document.createElement('div')
  const root = document.createElement('div')
  const styleEl = document.createElement('link')
  const shadowDOM = container.attachShadow({ mode: __DEV__ ? 'open' : 'closed' })
  styleEl.setAttribute('rel', 'stylesheet')
  styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
  shadowDOM.append(styleEl)
  shadowDOM.append(root)
  document.body.append(container)
  const app = createApp(App)
  setupApp(app)
  app.mount(root)
})()
