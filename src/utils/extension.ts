export function isAllowedFileSchemeAccess() {
  return browser.extension.isAllowedFileSchemeAccess()
}

export function isTabsApiAvailable() {
  return browser.tabs && typeof browser.tabs.sendMessage === 'function'
}

export function isContentScript() {
  return !!browser.runtime && !isTabsApiAvailable()
}
