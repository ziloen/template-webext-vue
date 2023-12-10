import { createApp } from 'vue'
import { setupApp } from '~/logic/common-setup'
import App from './views/App.vue'
import { onMessage } from '~/utils/webext'

console.info('[vitesse-webext] Hello world from content script')
const __NAME__ = 'vitesse-webext-content-script'

// mount component to context window
const container = document.createElement('div')
container.id = __NAME__
const root = document.createElement('div')
const shadowDOM = container.attachShadow?.({
  mode: IS_DEV ? 'open' : 'closed'
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
