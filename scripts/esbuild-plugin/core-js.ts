import fs from 'fs-extra'
import type { Plugin } from 'esbuild'


// TODO: useBuiltIns: 'usage'
/**
 * @example
 * ```js
 * const buildOptions = {
 *   plugins: [
 *     coreJSPlugin({
 *       polyfills: [
 *         'web.url.can-parse',
 *         'es.array.at',
 *         'proposals/set-methods'
 *       ]
 *     })
 *   ]
 * }
 * ```
 */
export default function coreJSPlugin(config: { polyfills: string[] }): Plugin {
  const polyfills = new Set<string>()

  for (const polyfill of config.polyfills) {
    polyfills.add(
      polyfill.includes('/')
        ? `core-js/${polyfill}`
        : `core-js/modules/${polyfill}`
    )
  }

  let code = ''
  for (const polyfill of polyfills) {
    code += `import "${polyfill}";\n`
  }

  return {
    name: 'core-js',
    setup(build) {
      const entryPoints = normalizeEntryPoints(build.initialOptions.entryPoints)

      build.onLoad({ filter: /.*/ }, async args => {
        if (!entryPoints.includes(args.path)) return

        const contents = await fs.readFile(args.path, 'utf8')

        return {
          contents: code + contents,
          loader: 'default',
        }
      })
    },
  }
}

function normalizeEntryPoints(
  entryPoints:
    | string[]
    | Record<string, string>
    | { in: string; out: string }[]
    | undefined
): string[] {
  if (!entryPoints) {
    return []
  }
  if (Array.isArray(entryPoints)) {
    return entryPoints.map(entry =>
      typeof entry === 'string' ? entry : entry.in
    )
  } else if (typeof entryPoints === 'object') {
    return Object.values(entryPoints)
  } else {
    throw new Error('Invalid entryPoints value')
  }
}
