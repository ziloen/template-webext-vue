import { format, vue } from '@ziloen/eslint-config'

/** @type { import("@ziloen/eslint-config").FlatESLintConfig[] } */
export default [
  ...vue({ tsconfigPath: './tsconfig.json' }),
  ...format,
  {
    ignores: [
      'volar.config.js',
    ]
  }
]