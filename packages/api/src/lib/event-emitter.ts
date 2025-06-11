import { EventEmitter, on } from "events";

/**
 * An extension of the Node.js `EventEmitter` that provides an iterable interface for event handling.
 * This class allows you to listen for events and consume them as an async iterable.
 * @template T - A record type that maps event names to their corresponding payload types.
 * @extends EventEmitter
 *
 * Example usage:
 * ```typescript
 * import { IterableEventEmitter } from './path/to/this/file';
 *
 * interface MessagePayload {
 *   message: string;
 *   timestamp: number;
 * }
 *
 * interface CodeEventPayload {
 *   code: number;
 *   description: string;
 * }
 *
 * interface MyEventMap extends Record<string, unknown> {
 *   messageEvents: MessagePayload;
 *   codeEvents: CodeEventPayload;
 * }
 *
 * const emitter = new IterableEventEmitter<MyEventMap>();
 *
 * // Emit an event
 * emitter.emit('messageEvents', { message: 'Hello, World!', timestamp: Date.now() });
 *
 * emitter.emit('codeEvents', { code: 200, description: 'OK' });
 *
 *
 * // Listen to the event as an async iterable
 * for await (const [payload] of emitter.toIterable('messageEvents')) {
 *   console.log(`Received event: ${payload.message} at ${payload.timestamp}`);
 * }
 *
 * // Listen to another event
 * for await (const [payload] of emitter.toIterable('codeEvents')) {
 *   console.log(`Received code event: ${payload.code} - ${payload.description}`);
 * }
 * ```
 */
export class IterableEventEmitter<
  T extends Record<string, unknown>,
> extends EventEmitter {
  /**
   * Returns an async iterable that yields event payloads for the specified event name.
   * The payload is wrapped in an array to match the behavior of Node's `on` method.
   *
   * @param eventName - The name of the event to create an iterable for.
   * @param opts - Optional options for event listening, as accepted by the `on` function.
   * @returns An `AsyncIterable` that yields payloads of type `[T[K]]` whenever the event is emitted.
   */
  toIterable<K extends keyof T & string>(
    eventName: K,
    opts?: NonNullable<Parameters<typeof on>[2]>,
  ): AsyncIterable<[T[K]]> {
    // Node's 'on' yields an array of arguments, so we yield [payload]
    return on(this, eventName, opts) as AsyncIterable<[T[K]]>;
  }
}
