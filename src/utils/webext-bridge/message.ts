import type { ErrorLike, ErrorObject } from 'serialize-error'
import { deserializeError, serializeError } from 'serialize-error'
import type { Runtime } from 'webextension-polyfill'

/**
 * Message protocol map
 *
 * messageID: [data, return]
 * @example
 * ```ts
 * type ProtocolMap = {
 *   example: [string, number]
 * }
 *
 * sendMessage('example', 'hello') // return: Promise<number>
 * onMessage('example', ({ data }) => data.length) // data: string, return: () => void
 * ```
 */
type ProtocolMap = {
  example: [string, number]
}

type BridgeMessage<T> = {
  id: string
  sender: Runtime.MessageSender
  data: T
  timestamp: number
}


type DataTypeKey = keyof ProtocolMap
type GetDataType<K extends DataTypeKey> = ProtocolMap[K][0]
type GetReturnType<K extends DataTypeKey> = ProtocolMap[K][1]

type OnMessageCallback<D = GetDataType<DataTypeKey>, R = GetReturnType<DataTypeKey>> = (
  message: BridgeMessage<D>
) => R | Promise<R>

type PassiveOnMessageCallback<D = GetDataType<DataTypeKey>> = (
  message: BridgeMessage<D>
) => void

type SendMessageParams<K extends DataTypeKey, D = GetDataType<K>> = [D] extends [never]
  ? [messageID: K]
  : [messageID: K, data: D]

export async function sendMessage<K extends DataTypeKey>(...args: SendMessageParams<K>) {
  const [messageID, data] = args
  const res = (await browser.runtime.sendMessage({ id: messageID, data })) as
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

const pasiveListenersMap = new Map<string, Set<PassiveOnMessageCallback>>()

export function onMessagePasive<K extends DataTypeKey>(
  messageID: K,
  callback: PassiveOnMessageCallback<GetDataType<K>>
) {
  const listeners = pasiveListenersMap.get(messageID) ?? new Set()
  listeners.add(callback)
  pasiveListenersMap.set(messageID, listeners)
  return () => listeners.delete(callback)
}

export function onMessage<K extends DataTypeKey>(
  messageID: K,
  callback: OnMessageCallback<GetDataType<K>, GetReturnType<K>>
) {
  const listener = listenersMap.get(messageID)
  if (listener) throw new Error(`Message ID "${messageID}" already has a listener.`)
  listenersMap.set(messageID, callback)
  return () => listenersMap.delete(messageID)
}

const listenersMap = new Map<string, OnMessageCallback>()

browser.runtime.onMessage.addListener((
  message: { id: DataTypeKey; data: GetDataType<DataTypeKey> },
  sender: Runtime.MessageSender
) => {
  const key = message.id

  const pasiveListeners = pasiveListenersMap.get(key)
  if (pasiveListeners) {
    for (const cb of pasiveListeners) {
      try {
        cb({ sender, data: message.data, id: key, timestamp: Date.now() })
      } catch {

      }
    }
  }

  const listener = listenersMap.get(key)
  if (!listener) return

  return Promise.resolve(listener({ sender, data: message.data, id: key, timestamp: Date.now() }))
    .then(data => ({ data }))
    .catch((error: Error) => ({ error: serializeError(error) }))
})

