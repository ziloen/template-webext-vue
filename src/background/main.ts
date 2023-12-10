browser.runtime.onInstalled.addListener((): void => {
  console.log('Extension installed')
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
    title: 'Open Settings',
  })

  browser.menus.onClicked.addListener((info, tab) => {
    console.log('menu clicked', info, tab)
    if (info.menuItemId === 'open-settings') {
      browser.runtime.openOptionsPage()
    }
  })
}
