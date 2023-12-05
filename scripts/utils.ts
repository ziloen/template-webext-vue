import { bgCyan, black } from 'kolorist'
import { resolve } from 'node:path'
// import { cwd } from 'node:process'

export const port = 3333
const cwd = process.cwd()
export const r = (...args: string[]) => resolve(cwd, ...args)
export const isDev = process.env.NODE_ENV !== 'production'
export const isFirefoxEnv = process.env.EXTENSION === 'firefox'

// export function log(name: string, message: string) {
//   // eslint-disable-next-line no-console
//   console.log(black(bgCyan(` ${name} `)), message)
// }
