import type { Manifest } from 'webextension-polyfill'
import { isDev, isFirefoxEnv } from '../scripts/utils'

type Permissions = Manifest.PermissionNoPrompt | Manifest.OptionalPermission
type OptionalPermissions = Manifest.OptionalPermission

export function getManifest() {
  // update this file to update this manifest.json
  // can also be conditional based on your need
  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 3,
    name: '[Extension Name]',
    version: '0.0.0',
    description: '[Extension Description]',
    action: {
      // default_icon: './icon-512.png',
      default_popup: './pages/popup/index.html'
    },
    options_ui: {
      page: './pages/options/index.html',
      open_in_tab: true
    },
    background: isFirefoxEnv
      ? { scripts: ['background/index.js'], type: 'module' }
      : { service_worker: './background/index.js' },
    // icons: {
    //   16: './icon-512.png',
    //   48: './icon-512.png',
    //   128: './icon-512.png'
    // },
    permissions: [
      'tabs',
      'storage',
      'activeTab',
      'menus'
      // 'omnibox',
    ] as Permissions[],
    optional_permissions: [] as OptionalPermissions[],
    host_permissions: ['<all_urls>', '*://*/*'],
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['content-scripts/index.js']
      }
    ],
    web_accessible_resources: [
      {
        resources: ['content-scripts/index.css'],
        matches: ['<all_urls>']
      }
    ],
    content_security_policy: {
      extension_pages:
        isDev && !isFirefoxEnv
          ? `script-src 'self' http://127.0.0.1:3333; object-src 'self'`
          : "script-src 'self'; object-src 'self'"
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
