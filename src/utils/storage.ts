/**
 * Get storage.local value
 * @example
 * ```ts
 * const data = await getStorageLocal<number[]>('a')
 * //    ^ number[] | undefined
 * ```
 */
export async function getStorageLocal<T>(key: string): Promise<T | undefined>
/**
 * Get storage.local value with default value
 * @example
 * ```ts
 * const a = await getStorageLocal<number[]>('a', [])
 * //    ^ number[]
 * ```
 */
export async function getStorageLocal<T>(
  key: string,
  defaultValue: T
): Promise<T>
/**
 * Get multiple storage.local values
 * @example
 * ```ts
 * const { a, b } = await getStorageLocal<{ a: string, b: number }>(['a', 'b'])
 * //      ^ { a?: string, b?: number }
 * ```
 */
export async function getStorageLocal<T extends Record<string, unknown>>(
  key: string[]
): Promise<Partial<T>>
/**
 * Get multiple storage.local values with default values
 * @example
 * ```ts
 * const { a, b } = await getStorageLocal({ a: 123, b: 'b' })
 * //      ^ { a: number, b: string }
 * ```
 */
export async function getStorageLocal<T extends Record<string, unknown>>(
  obj: T
): Promise<T>
export async function getStorageLocal(
  key: string | string[],
  defaultValue?: unknown
) {
  const result = await browser.storage.local.get(key)
  if (typeof key === 'string') {
    // If key exists in storage.local
    if (Object.hasOwn(result, key)) {
      return result[key] as unknown
    }

    // If key does not exist in storage.local
    return defaultValue
  } else {
    return result
  }
}
