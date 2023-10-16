export interface Options {
  /** A Unix timestamp used to set a reminder to periodically update a snapshot */
  expiry?: number
  /** Force a snapshot to update */
  update?: boolean
}

/**
 * A tiny utility to save and retrieve snapshots when testing.
 *
 * @param key - A unique name to identify the snapshot
 * @param value - A JSON serializable value to be stored
 * @param [options] - Configuration options for the snapshot
 * @returns A promise that is fulfilled with the new or previously stored value
 */

export default function snap<T = any>(key: string, value: T, opts: Options = {}): Promise<T>
