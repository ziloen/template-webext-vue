import { createApp } from 'vue'
import { onMessage } from 'webext-bridge/content-script'
import { setupApp } from '~/logic/common-setup'
import App from './views/App.vue'

console.info('[vitesse-webext] Hello world from content script')

// communication example: send previous tab title from background page
onMessage('tab-prev', ({ data }) => {
  console.log(`[vitesse-webext] Navigate from page "${data.title}"`)
})

// mount component to context window
const container = document.createElement('div')
container.id = __NAME__
const root = document.createElement('div')
const shadowDOM = container.attachShadow?.({
  mode: __DEV__ ? 'open' : 'closed'
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
setupApp(app)
app.mount(root)
