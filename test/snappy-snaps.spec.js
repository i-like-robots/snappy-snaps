import { afterEach, describe, it, mock } from 'node:test'
import fs from 'node:fs/promises'
import url from 'node:url'
import path from 'node:path'
import assert from 'node:assert'
import subject from '../lib/snappy-snaps.js'

const TEST_PATH = url.fileURLToPath(import.meta.url)
const SNAPSHOTS_DIR = path.join(path.dirname(TEST_PATH), '__snapshots__')
const SNAPSHOT_NAME = `${path.basename(TEST_PATH)}.snap`
const SNAPSHOT_PATH = path.join(SNAPSHOTS_DIR, SNAPSHOT_NAME)

describe('lib/snappy-snaps', () => {
  afterEach(async () => {
    await fs.rm(SNAPSHOTS_DIR, { recursive: true, force: true })
  })

  it('writes a __snapshots__ directory to disk', async () => {
    assert.rejects(() => fs.access(SNAPSHOTS_DIR, fs.constants.OK))
    await subject('dog', null)
    assert.doesNotReject(() => fs.access(SNAPSHOTS_DIR, fs.constants.OK))
  })

  it('writes a snapshot file to disk with caller file name', async () => {
    assert.rejects(() => fs.access(SNAPSHOT_PATH, fs.constants.OK))
    await subject('dog', null)
    assert.doesNotReject(() => fs.access(SNAPSHOT_PATH, fs.constants.OK))
  })

  it('returns data from snapshot file on second call', async () => {
    await subject('dog', { name: 'Ness' })

    const data = await subject('dog', { name: 'Gino' })

    assert.equal(data.name, 'Ness')
  })

  it('can serialize dates, maps, sets, regexps and more', async () => {
    await subject('superset', {
      inf: Infinity,
      date: new Date('Thu, 28 Apr 2016 22:02:17 GMT'),
      map: new Map([['hello', 'world']]),
      set: new Set([123, 456]),
      fn: function echo(arg) {
        return arg
      },
      re: /([^\s]+)/g,
    })

    const data = await subject('superset')

    assert.ok(data.inf === Infinity)
    assert.ok(data.date instanceof Date)
    assert.ok(data.map instanceof Map)
    assert.ok(data.set instanceof Set)
    assert.ok(data.fn instanceof Function)
    assert.ok(data.re instanceof RegExp)
  })

  it('appends to the snapshot file when called with a new key', async () => {
    await subject('dog', { name: 'Ness' })
    await subject('cat', { name: 'Luna' })

    const dog = await subject('dog', null)
    const cat = await subject('cat', null)

    assert.equal(dog.name, 'Ness')
    assert.equal(cat.name, 'Luna')
  })

  it('updates the snapshot when called with the update option', async () => {
    await subject('dog', { name: 'Ness' })
    const data = await subject('dog', { name: 'Gino' }, { update: true })

    assert.equal(data.name, 'Gino')
  })

  it('updates snapshots when run with the update flag', async () => {
    await subject('dog', { name: 'Ness' })

    process.argv.push('-u')

    const data = await subject('dog', { name: 'Gino' })

    process.argv.pop()

    assert.equal(data.name, 'Gino')

    process.argv.push('--updateSnapshot')

    const data2 = await subject('dog', { name: 'Gino' })

    process.argv.pop()

    assert.equal(data2.name, 'Gino')
  })

  it('updates snapshots when run with the update environment variable', async () => {
    await subject('dog', { name: 'Ness' })

    process.env.UPDATE_SNAPSHOT = ''

    const data = await subject('dog', { name: 'Gino' })

    delete process.env.UPDATE_SNAPSHOT

    assert.equal(data.name, 'Gino')
  })

  it('warns when snapshots are past their expiry date', async () => {
    const fn = mock.method(console, 'warn')

    await subject('dog', { name: 'Ness' }, { expires: Date.now() - 1 })
    assert.equal(fn.mock.calls.length, 0)

    await subject('dog', null)
    assert.match(fn.mock.calls[0].arguments[0], /expired/)

    fn.mock.restore()
  })
})
