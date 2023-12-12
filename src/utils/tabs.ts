/**
 * alias for `(await browser.tabs.query({ currentWindow: true, active: true }))[0]`
 */
export async function getActiveTab() {
  return (await browser.tabs.query({ currentWindow: true, active: true }))[0]!
}
