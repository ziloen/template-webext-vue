import type { ErrorObject } from 'serialize-error'
import { deserializeError, serializeError } from 'serialize-error'
import type { ReadonlyDeep } from 'type-fest'
import type { Runtime } from 'webextension-polyfill'
import type { MessageProtocol } from './index'
import type { IfNever, Promisable } from 'type-fest'

type Message<T> = {
  id: string
  sender: Runtime.MessageSender
  data: T
  timestamp: number
}

type MsgKey = keyof MessageProtocol
type MsgData<K extends MsgKey> = MessageProtocol[K][0]
type MsgReturn<K extends MsgKey> = MessageProtocol[K][1]

type MsgCallback<D = MsgData<MsgKey>, R = MsgReturn<MsgKey>> = (
  message: Message<D>
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
) => IfNever<R, void, Promisable<R>>

type PassiveCallback<D = MsgData<MsgKey>> = (message: Message<D>) => void

type Params<K extends MsgKey, D = MsgData<K>> = IfNever<
  D,
  [id: K, data?: undefined | null, options?: SendOptions],
  [id: K, data: D, options?: SendOptions]
>

type SendOptions = {
  tabId?: number | undefined
  frameId?: number | undefined
}

export async function sendMessage<K extends MsgKey>(...args: Params<K>) {
  const [id, data, options = {}] = args

  const tabId = options.tabId
  const frameId = options.frameId

  type Res = { data: MsgReturn<K> } | { error: ErrorObject } | null

  const res =
    tabId === undefined
      ? ((await browser.runtime.sendMessage({ id, data })) as Res)
      : ((await browser.tabs.sendMessage(
          tabId,
          { id, data },
          frameId === undefined ? undefined : { frameId }
        )) as Res)

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

const listenersMap = new Map<string, MsgCallback>()
const pasiveListenersMap = new Map<string, Set<PassiveCallback>>()

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
export function onMessage<K extends MsgKey>(
  id: K,
  callback: MsgCallback<MsgData<K>, MsgReturn<K>>,
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
export function onMessage<K extends MsgKey>(
  id: K,
  callback: PassiveCallback<ReadonlyDeep<MsgData<K>>>,
  passive: true
): () => void
export function onMessage<K extends MsgKey>(
  id: K,
  callback: MsgCallback<MsgData<K>, MsgReturn<K>>,
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
    message: { id: MsgKey; data: MsgData<MsgKey> },
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
