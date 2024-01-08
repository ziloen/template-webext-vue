/**
 * @file Devtools Background Script
 */

if (browser.devtools && browser.devtools.panels) {
  browser.devtools.panels.create(
    'Vue Devtools',
    'icons/128.png',
    'pages/devtool-panel/index.html'
  )
}
