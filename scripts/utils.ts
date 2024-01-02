import { resolve } from 'node:path'

export const port = 3333
const cwd = process.cwd()
export const r = (...args: string[]) => resolve(cwd, ...args)
export const isDev = process.env.NODE_ENV !== 'production'
export const isFirefoxEnv = process.env.EXTENSION === 'firefox'
