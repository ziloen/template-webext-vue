import type { Manifest } from 'webextension-polyfill'
import { isDev, isFirefoxEnv } from '../scripts/utils'

type Permissions = Manifest.PermissionNoPrompt | Manifest.OptionalPermission
type OptionalPermissions = Manifest.OptionalPermission
type MV2Keys = 'browser_action' | 'user_scripts' | 'page_action'

export function getManifest() {
  // update this file to update this manifest.json
  // can also be conditional based on your need
  const manifest: Omit<Manifest.WebExtensionManifest, MV2Keys> = {
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
      extension_pages: "script-src 'self'; object-src 'self'"
    }
  }

  if (isFirefoxEnv) {
    manifest.browser_specific_settings = {
      gecko: {
        id: '[Extension ID]',
        // Firefox ESR latest version
        strict_min_version: '115.0'
      }
    }
  }

  return manifest
}
