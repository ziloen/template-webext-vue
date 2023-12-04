export * from './message'
export * from './stream'

/**
 * Stream protocol map
 *
 * channel: [data, return]
 *
 * @example
 * ```ts
 * type StreamProtocolMap = {
 *   example: [data: string, return: number]
 * }
 *
 * // sender: open stream and send data then listen for return
 * const stream = openStream('example')
 * stream.send('hello')
 * stream.onMessage((msg) => console.log(msg)) // msg: number
 *
 * // receiver: listen for stream and send return
 * onOpenStreamChannel('example', (stream) => {
 *   stream.onMessage(async (msg) => {
 *     const data = await doSomething(msg) // msg: string
 *     stream.send(data) // data: number
 *   })
 * })
 * ```
 */
export type StreamProtocol = {
  example: [string, number]
}

/**
 * Message protocol map
 *
 * messageID: [data, return]
 * @example
 * ```ts
 * type MessageProtocol = {
 *   example: [string, number]
 * }
 *
 * // sender: send message "hello", and wait Promise<number>
 * sendMessage('example', 'hello')
 *
 * // receiver: listen for message and send return
 * onMessage('example', ({ data }) => data.length)
 * ```
 */
export type MessageProtocol = {
  'tab-prev': [{ title?: string | undefined }, never]
  'get-current-tab': [never, { title?: string | undefined }]
}
