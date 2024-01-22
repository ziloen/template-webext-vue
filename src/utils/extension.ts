export function isAllowedFileSchemeAccess() {
  return browser.extension.isAllowedFileSchemeAccess()
}

export function isTabsApiAvailable() {
  return browser.tabs && typeof browser.tabs.sendMessage === 'function'
}

export function isContentScript() {
  return !!browser.runtime && !isTabsApiAvailable()
}

export async function openSidebar() {
  if (browser.sidebarAction) {
    return browser.sidebarAction.open()
  }

  if (browser.sidePanel) {
    const { id } = await browser.windows.getCurrent()
    if (!id) throw new Error('No current window ID')
    return browser.sidePanel.open({ windowId: id })
  }

  throw new Error('No sidebar API available')
}
