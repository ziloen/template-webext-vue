import UnoCSS from '@unocss/postcss'
import { build, context } from 'esbuild'
import stylePlugin from 'esbuild-style-plugin'
import { resolve } from 'node:path'
import AutoImport from 'unplugin-auto-import/esbuild'
import VueJSX from 'unplugin-vue-jsx/esbuild'
import Vue from 'unplugin-vue/esbuild'
import fs from 'fs-extra'
import { htmlPlugin } from '@craftamap/esbuild-plugin-html'

/**
 * @typedef {import("esbuild").Plugin} Plugin
 */

const isDev = process.env.NODE_ENV === 'development'
const cwd = process.cwd()
const r = (/** @type {string[]} */ ...args) => resolve(cwd, ...args)
const port = 3333

/** @type { import("esbuild").BuildOptions } */
const options = {
  entryPoints: [
    // Content Scripts
    {
      in: r('src/content-scripts/index.ts'),
      out: 'content-scripts/index'
    },

    // Background
    {
      in: r('src/background/main.ts'),
      out: 'background/index'
    },

    // Popup Page
    {
      in: r('src/pages/popup/index.html'),
      out: 'pages/popup/index.html'
    },

    // Options Page
    {
      in: r('src/pages/options/index.html'),
      out: 'pages/options/index.html'
    }
  ],
  legalComments: 'none',
  metafile: false,
  bundle: true,
  sourcemap: isDev,
  outdir: r('dist/dev'),
  assetNames: 'assets/[name]-[hash]',
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      isDev ? 'development' : 'production'
    ),
    IS_DEV: JSON.stringify(isDev)
  },
  drop: isDev ? undefined : ['console', 'debugger'],
  minify: !isDev,
  plugins: [
    /** @type {Plugin} */
    (
      VueJSX({
        include: [/\.tsx$/],
        sourceMap: isDev,
        root: cwd
      })
    ),
    Vue({
      sourceMap: isDev,
      root: cwd
    }),
    AutoImport({
      imports: [
        'vue',
        {
          'webextension-polyfill': [['*', 'browser']],
          ulid: ['ulid']
        }
      ],
      dts: r('src/types/auto-imports.d.ts')
    }),
    stylePlugin({
      postcss: {
        plugins: [/** @type {any} */ (UnoCSS)]
      }
    }),
    htmlPlugin({
      files: [

      ]
    })
  ]
}

fs.emptyDirSync(r("dist/dev"))

if (isDev) {

  // @ts-ignore
  context(options).then(async ctx => {
    await ctx.watch()
    const { host } = await ctx.serve({ port })
    console.log(`Server running at http://${host}:${port}`)
  })
} else {
  build(options)
}
