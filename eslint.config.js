import { vue } from '@ziloen/eslint-config'

/** @type { import("@ziloen/eslint-config").FlatESLintConfig[] } */
export default [
  ...vue({ tsconfigPath: './tsconfig.json' }),
  {
    ignores: ['volar.config.js'],
  },
  {
    rules: {
      'no-undef': 'off',
    },
  },
]
