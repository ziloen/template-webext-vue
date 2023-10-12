/// <reference types="vitest" />

import Vue from '@vitejs/plugin-vue'
import { dirname, relative } from 'node:path'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'
import { isDev, port, r } from './scripts/utils'

export const sharedConfig: UserConfig = {
  root: r('src'),
  resolve: {
    alias: {
      '~/': `${r('src')}/`
    }
  },

  define: {
    __DEV__: isDev
  },

  plugins: [
    Vue(),

    AutoImport({
      imports: [
        'vue',
        {
          'webextension-polyfill': [['*', 'browser']],
          ulid: ['ulid']
        },
      ],
      dts: r('src/types/auto-imports.d.ts')
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      dirs: [r('src/components')],
      // generate `components.d.ts` for ts support with Volar
      dts: r('src/types/components.d.ts'),
      resolvers: [
        // auto import icons
        IconsResolver({
          componentPrefix: ''
        })
      ]
    }),

    // https://github.com/antfu/unplugin-icons
    Icons(),

    // https://github.com/unocss/unocss
    UnoCSS(),

    // rewrite assets to use relative path
    {
      name: 'assets-rewrite',
      enforce: 'post',
      apply: 'build',
      transformIndexHtml(html, { path }) {
        return html.replace(/"\/assets\//g, `"${relative(dirname(path), '/assets')}/`)
      }
    }
  ],
  optimizeDeps: {
    include: [
      'vue',
      '@vueuse/core',
      'webextension-polyfill'
    ]
  }
}

export default defineConfig(({ command }) => ({
  ...sharedConfig,
  base: command === 'serve' ? `http://localhost:${port}/` : '/dist/',
  server: {
    port,
    hmr: {
      host: 'localhost'
    }
  },
  build: {
    outDir: r('extension/dist'),
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
    // https://developer.chrome.com/docs/webstore/program_policies/#:~:text=Code%20Readability%20Requirements
    terserOptions: {
      mangle: false
    },
    rollupOptions: {
      input: {
        options: r('src/pages/options/index.html'),
        popup: r('src/pages/popup/index.html')
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
}))
