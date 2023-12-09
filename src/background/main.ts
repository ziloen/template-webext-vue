import type { Tabs } from 'webextension-polyfill'
import { onMessage, sendMessage } from '~/utils/webext'

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

let previousTabId = 0

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId
    return
  }

  let tab: Tabs.Tab

  try {
    tab = await browser.tabs.get(previousTabId)
    previousTabId = tabId
  } catch {
    return
  }

  // eslint-disable-next-line no-console
  console.log('previous tab', tab)
  sendMessage('tab-prev', { title: tab.title })
})

// Only works in Firefox
if (IS_FIREFOX_ENV) {
  // Open options page on browser action middle click
  browser.action.onClicked.addListener((tab, info) => {
    if (info?.button === 1) {
      browser.runtime.openOptionsPage()
    } else {
      browser.action.openPopup()
    }
  })

  // Add "Open Settings" to browser action context menu
  browser.menus.create({
    id: 'open-settings',
    contexts: ['action'],
    title: 'Open Settings'
  })

  browser.menus.onClicked.addListener((info, tab) => {
    console.log('menu clicked', info, tab)
    if (info.menuItemId === 'open-settings') {
      browser.runtime.openOptionsPage()
    }
  })
}

onMessage('get-current-tab', async () => {
  try {
    const tab = await browser.tabs.get(previousTabId)
    return {
      title: tab?.title
    }
  } catch {
    return {
      title: undefined
    }
  }
})
