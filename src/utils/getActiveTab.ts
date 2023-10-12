export async function getActiveTab() {
  return (await browser.tabs.query({ currentWindow: true, active: true }))[0]
}