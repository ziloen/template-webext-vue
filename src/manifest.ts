import type { Manifest } from 'webextension-polyfill'
import { isDev, isFirefoxEnv } from '../scripts/utils'

export function getManifest() {
  // update this file to update this manifest.json
  // can also be conditional based on your need
  const manifest: MV3 = {
    manifest_version: 3,
    version: '0.0.0',
    name: '[Extension Name]',

    short_name: '[Extension Short Name]',
    description: '[Extension Description]',
    // icons: {
    //   16: './icon-512.png',
    //   48: './icon-512.png',
    //   128: './icon-512.png'
    // },

    action: {
      // default_icon: './icon-512.png',
      default_popup: './pages/popup/index.html',
    },
    options_ui: {
      page: './pages/options/index.html',
      open_in_tab: true,
    },
    background: isFirefoxEnv
      ? { scripts: ['background/index.js'], type: 'module' }
      : { service_worker: './background/index.js', type: 'module' },

    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['content-scripts/index.js'],
        run_at: 'document_start',
      },
    ],

    permissions: [
      'activeTab',
      'alarms',
      // Firefox use `menus` instead of `contextMenus`
      isFirefoxEnv ? 'menus' : 'contextMenus',
      'storage',
      'tabs',
      'cookies',
    ] as Permissions[],
    optional_permissions: [] as OptionalPermissions[],
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
    // https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns
    host_permissions: [
      '<all_urls>',
      '*://*/*',
      isFirefoxEnv ? 'file:///*' : 'file:///',
    ],
    web_accessible_resources: [
      {
        resources: ['content-scripts/index.css'],
        matches: ['<all_urls>'],
      },
    ],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src self'",
    },
  }

  // Browser specific settings
  if (isFirefoxEnv) {
    manifest.browser_specific_settings = {
      gecko: {
        id: '[Extension ID]',
        // Firefox ESR latest version
        strict_min_version: '115.0',
      },
    }

    if (manifest.side_panel) {
      manifest.sidebar_action = {
        default_panel: manifest.side_panel.default_path,
      }

      delete manifest.side_panel
    }
  } else {
    manifest.minimum_chrome_version = '100'
  }

  return manifest
}

type ChromiumPermissions = 'sidePanel'

/**
 * manifest.permissions
 */
type Permissions =
  | Manifest.PermissionNoPrompt
  | Manifest.OptionalPermission
  | ChromiumPermissions

/**
 * manifest.optional_permissions
 */
type OptionalPermissions = Manifest.OptionalPermission

// deprecated keys
type MV2Keys = 'browser_action' | 'user_scripts' | 'page_action'

type ChromiumManifest = {
  side_panel?: {
    default_path: string
  }
}

/**
 * Manifest V3
 */
type MV3 = Omit<Manifest.WebExtensionManifest, MV2Keys> & ChromiumManifest
