import { transform } from '@svgr/core'
import { readFile } from 'node:fs/promises'
import type { Config } from '@svgr/core'
import type { Plugin } from 'esbuild'

type Options = {
  svgrOptions?: Config
  /**
   * The suffix of the import path.
   * @default 'rc'
   */
  suffix?: string
}

/**
 * @example
 * ```ts
 * const buildOptions = {
 *   plugins: [
 *     svgrPlugin({ suffix: 'rc', svgrOptions: {} })
 *   ]
 * }
 * ```
 * Usage:
 * ```tsx
 * import Logo from 'path/to/logo.svg?rc'
 *
 * function App() {
 *   return <Logo className="text-lg" />
 * }
 * ```
 */
export default function svgrPlugin({
  suffix = 'rc',
  svgrOptions = {},
}: Options = {}): Plugin {
  if (
    svgrOptions.plugins &&
    !svgrOptions.plugins.includes('@svgr/plugin-jsx')
  ) {
    svgrOptions.plugins = ['@svgr/plugin-jsx', ...svgrOptions.plugins]
  } else if (!svgrOptions.plugins) {
    svgrOptions.plugins = ['@svgr/plugin-jsx']
  }

  return {
    name: 'svgr',
    setup(build) {
      build.onLoad({ filter: /\.svg$/ }, async args => {
        if (args.suffix !== `?${suffix}`) return

        const svg = await readFile(args.path, { encoding: 'utf8' })
        const contents = await transform(svg, svgrOptions, {
          filePath: args.path,
        })

        return {
          contents,
          loader: 'jsx',
        }
      })
    },
  }
}
