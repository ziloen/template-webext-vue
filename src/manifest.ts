import fs from 'fs-extra'
import type { Manifest } from 'webextension-polyfill'
import type PkgType from '../package.json'
import { isDev, isFirefoxEnv, port, r } from '../scripts/utils'

export async function getManifest() {
  const pkg = await fs.readJSON(r('package.json')) as typeof PkgType

  // update this file to update this manifest.json
  // can also be conditional based on your need
  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 3,
    name: pkg.displayName || pkg.name,
    version: pkg.version,
    description: pkg.description,
    action: {
      default_icon: './assets/icon-512.png',
      default_popup: './dist/pages/popup/index.html'
    },
    options_ui: {
      page: './dist/pages/options/index.html',
      open_in_tab: true
    },
    background: isFirefoxEnv
      ? { scripts: ['dist/background/index.mjs'], type: 'module' }
      : { service_worker: './dist/background/index.mjs' },
    icons: {
      16: './assets/icon-512.png',
      48: './assets/icon-512.png',
      128: './assets/icon-512.png'
    },
    permissions: [
      'tabs',
      'storage',
      'activeTab',
      // 'omnibox',
    ],
    host_permissions: [
      '<all_urls>',
      '*://*/*',
    ],
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['dist/content-scripts/index.js']
      }
    ],
    web_accessible_resources: [
      {
        resources: ['dist/content-scripts/style.css'],
        matches: ['<all_urls>']
      }
    ],
    content_security_policy: {
      extension_pages: isDev
        ? `script-src 'self' http://localhost:${port}; object-src 'self'`
        : 'script-src \'self\'; object-src \'self\''
    }
  }

  if (isDev) {
    // for content script, as browsers will cache them for each reload,
    // we use a background script to always inject the latest version
    // see src/background/contentScriptHMR.ts
    // delete manifest.content_scripts
    manifest.permissions?.push('webNavigation')
  }

  return manifest
}
