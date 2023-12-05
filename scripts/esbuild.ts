import { htmlPlugin } from '@craftamap/esbuild-plugin-html'
import UnoCSS from '@unocss/postcss'
import chokidar from 'chokidar'
import type { BuildOptions, Plugin } from 'esbuild'
import { build, context } from 'esbuild'
import stylePlugin from 'esbuild-style-plugin'
import fs from 'fs-extra'
import AutoImport from 'unplugin-auto-import/esbuild'
import VueJSX from 'unplugin-vue-jsx/esbuild'
import Vue from 'unplugin-vue/esbuild'
import { getManifest } from '../src/manifest'
import { isDev, isFirefoxEnv, port, r } from './utils'

const cwd = process.cwd()
const outdir = r('dist/dev')

const options: BuildOptions = {
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

    // Options Page
    {
      in: r('src/pages/options/main.ts'),
      out: 'pages/options/index'
    },

    // Popup Page
    {
      in: r('src/pages/popup/main.ts'),
      out: 'pages/popup/index'
    }
  ],
  legalComments: 'none',
  // esbuild-plugin-html need metafile to work
  metafile: true,
  bundle: true,
  sourcemap: isDev,
  outdir: outdir,
  assetNames: 'assets/[name]-[hash]',
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      isDev ? 'development' : 'production'
    ),
    IS_DEV: JSON.stringify(isDev),
    IS_FIREFOX_ENV: JSON.stringify(isFirefoxEnv)
  },
  drop: isDev ? [] : ['console', 'debugger'],
  minify: !isDev,
  loader: {
    '.svg': 'file',
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.mp4': 'file'
  },
  plugins: [
    Vue({
      sourceMap: isDev,
      root: cwd
    }),
    VueJSX({
      include: [/\.tsx$/],
      sourceMap: isDev,
      root: cwd
    }) as unknown as Plugin,
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/, // .vue
        /\.vue\?vue/
      ],
      imports: [
        'vue',
        {
          'webextension-polyfill': [['*', 'browser']],
          ulid: ['ulid']
        }
      ],
      dts: r('src/types/auto-imports.d.ts')
    }) as Plugin,
    stylePlugin({
      postcss: {
        plugins: [UnoCSS()]
      }
    }),
    htmlPlugin({
      files: [
        {
          entryPoints: ['src/pages/options/main.ts'],
          filename: 'pages/options/index.html',
          // title: 'Options Page',
          scriptLoading: 'module',
          htmlTemplate: fs.readFileSync(r('src/pages/options/index.html'), {
            encoding: 'utf-8'
          })
        },
        {
          entryPoints: ['src/pages/popup/main.ts'],
          filename: 'pages/popup/index.html',
          // title: 'Popup Page',
          scriptLoading: 'module',
          htmlTemplate: fs.readFileSync(r('src/pages/popup/index.html'), {
            encoding: 'utf-8'
          })
        }
      ]
    })
  ]
}

fs.emptyDirSync(outdir)

writeManifest()

if (isDev) {
  context(options).then(ctx => ctx.watch())
  // const { host } = await ctx.serve({ port, host: 'localhost' })
  // console.log(`Server running at http://${host}:${port}`)

  chokidar.watch(r('src/manifest.ts')).on('change', writeManifest)
} else {
  build(options)
}

function writeManifest() {
  console.log('Writing manifest.json')
  return fs.writeJSON(r(outdir, 'manifest.json'), getManifest(), {
    spaces: 2
  })
}
