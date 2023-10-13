import { Fn } from '@wai-ri/core'
import { Scripting } from 'webextension-polyfill'


interface InjectionResult<T> extends Scripting.InjectionResult {
  result?: T | undefined
  error?: unknown
}


/**
 * same as `browser.scripting.executeScript` but with type and only accept function
 */
export async function execFunc<T extends Fn>(
  target: Scripting.InjectionTarget,
  func: T,
  ...args: Parameters<T>
) {
  const [execResult] = await browser.scripting.executeScript({
    target,
    func,
    args
  })

  if (!execResult) throw new Error('No result')

  const { error, result } = execResult as InjectionResult<ReturnType<T>>

  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result as ReturnType<T>
}