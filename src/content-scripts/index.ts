import { createApp } from 'vue'
import App from './views/App.vue'

console.info('[vitesse-webext] Hello world from content script')

document.addEventListener('load', () => {
  // mount component to context window
  const container = document.createElement('div')
  const root = document.createElement('div')
  const shadowDOM = container.attachShadow?.({
    mode: IS_DEV ? 'open' : 'closed',
  })

  // style injection example 1
  // const styleSheet = new CSSStyleSheet()
  // styleSheet.replaceSync(await (await fetch(browser.runtime.getURL('dist/contentScripts/style.css'))).text())
  // shadowDOM.adoptedStyleSheets = [styleSheet]

  // style injection example 2
  const styleEl = document.createElement('link')
  styleEl.setAttribute('rel', 'stylesheet')
  styleEl.setAttribute(
    'href',
    globalThis.browser!.runtime.getURL('dist/contentScripts/style.css')
  )
  shadowDOM.append(styleEl)
  shadowDOM.append(root)
  document.body.append(container)
  const app = createApp(App)
  app.mount(root)
})
