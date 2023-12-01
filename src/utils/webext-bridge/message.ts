import type { ErrorObject } from 'serialize-error'
import { deserializeError, serializeError } from 'serialize-error'
import type { Runtime } from 'webextension-polyfill'
import type { MessageProtocol } from './index'

type BridgeMessage<T> = {
  id: string
  sender: Runtime.MessageSender
  data: T
  timestamp: number
}

type DataTypeKey = keyof MessageProtocol
type GetDataType<K extends DataTypeKey> = MessageProtocol[K][0]
type GetReturnType<K extends DataTypeKey> = MessageProtocol[K][1]

type OnMessageCallback<
  D = GetDataType<DataTypeKey>,
  R = GetReturnType<DataTypeKey>
> = (message: BridgeMessage<D>) => R | Promise<R>

type PassiveOnMessageCallback<D = GetDataType<DataTypeKey>> = (
  message: BridgeMessage<D>
) => void

type SendMessageParams<K extends DataTypeKey, D = GetDataType<K>> = [
  D
] extends [never]
  ? [id: K]
  : [id: K, data: D]

export async function sendMessage<K extends DataTypeKey>(
  ...args: SendMessageParams<K>
) {
  const [id, data] = args
  const res = (await browser.runtime.sendMessage({ id, data })) as
    | { data: GetReturnType<K> }
    | { error: ErrorObject }
    | null

  if (!res) {
    throw new Error(
      'null from runtime.sendMessage. Maybe multiple async runtime.onMessage listeners.'
    )
  }

  if (Object.hasOwn(res, 'error')) {
    throw deserializeError(res.error)
  }

  return res.data
}

const listenersMap = new Map<string, OnMessageCallback>()
const pasiveListenersMap = new Map<string, Set<PassiveOnMessageCallback>>()

/**
 * Add a listener to the message channel.
 *
 * You can only add one listener to the same channel.
 *
 * @example
 * ```ts
 * const dispose = onMessage(
 *   "get message length",
 *   ({ data }) => data.length
 * )
 * ```
 */
export function onMessage<K extends DataTypeKey>(
  id: K,
  callback: OnMessageCallback<GetDataType<K>, GetReturnType<K>>,
  passive?: false | undefined
): () => void
/**
 * Add a passive listener to the message channel.
 *
 * Passive listeners return value is ignored.
 *
 * You can add multiple passive listeners to the same channel.
 *
 * @example
 * ```ts
 * const dispose = onMessage(
 *   "log length to console",
 *   ({ data }) => { console.log(data.length) },
 *   true
 * )
 * ```
 */
export function onMessage<K extends DataTypeKey>(
  id: K,
  callback: PassiveOnMessageCallback<GetDataType<K>>,
  passive: true
): () => void
export function onMessage<K extends DataTypeKey>(
  id: K,
  callback: OnMessageCallback<GetDataType<K>, GetReturnType<K>>,
  passive = false
) {
  if (passive) {
    const listeners = pasiveListenersMap.get(id) ?? new Set()
    listeners.add(callback)
    pasiveListenersMap.set(id, listeners)
    return () => listeners.delete(callback)
  }

  const listener = listenersMap.get(id)
  if (listener) throw new Error(`Message ID "${id}" already has a listener.`)
  listenersMap.set(id, callback)
  return () => listenersMap.delete(id)
}

browser.runtime.onMessage.addListener(
  (
    message: { id: DataTypeKey; data: GetDataType<DataTypeKey> },
    sender: Runtime.MessageSender
  ) => {
    const id = message.id

    const passiveListeners = pasiveListenersMap.get(id)
    if (passiveListeners) {
      for (const cb of passiveListeners) {
        try {
          cb({ sender, data: message.data, id, timestamp: Date.now() })
        } catch (e) {
          console.error(e)
        }
      }
    }

    const listener = listenersMap.get(id)
    if (!listener) return

    return Promise.resolve(
      listener({ sender, data: message.data, id, timestamp: Date.now() })
    )
      .then(data => ({ data }))
      .catch((error: Error) => ({ error: serializeError(error) }))
  }
)
