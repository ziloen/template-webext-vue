/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import Vue from '@vitejs/plugin-vue'
import { dirname, relative } from 'node:path'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import type { Plugin, UserConfig } from 'vite'
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
        }
      ],
      dts: r('src/types/auto-imports.d.ts')
    }) as Plugin,

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

    // https://github.com/vitejs/vite/tree/main/packages/plugin-legacy
    legacy({
      // render legacy chunks for non-modern browsers
      renderLegacyChunks: false,
      /** polyfills for non-modern browsers (not supports esm) */
      // polyfills: [],
      /** polyfills for modern browsers (supports esm) */
      modernPolyfills: [
        // proposals
        /** Array.fromAsync() */
        'esnext.array.from-async',
        'esnext.promise.with-resolvers',
        'proposals/set-methods',

        // Web APIs
        /** structuredClone() */
        'web.structured-clone',
        /** URL.canParse() */
        'web.url.can-parse',

        // ES2023
        /** Array.prototype.findLast() */
        'es.array.find-last',
        /** Array.prototype.findLastIndex() */
        'es.array.find-last-index',
        /** TypedArray.prototype.findLast() */
        'es.typed-array.find-last',
        /** TypedArray.prototype.findLastIndex() */
        'es.typed-array.find-last-index',
        /** Array.prototype.toReversed() */
        'esnext.array.to-reversed',
        /** Array.prototype.toSorted() */
        'esnext.array.to-sorted',
        /** Array.prototype.toSpliced() */
        'esnext.array.to-spliced',
        /** Array.prototype.with() */
        'esnext.array.with'
      ]
    }),

    // rewrite assets to use relative path
    {
      name: 'assets-rewrite',
      enforce: 'post',
      apply: 'build',
      transformIndexHtml(html, { path }) {
        return html.replace(
          /"\/assets\//g,
          `"${relative(dirname(path), '/assets')}/`
        )
      }
    }
  ],
  optimizeDeps: {
    include: ['vue', '@vueuse/core', 'webextension-polyfill']
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
