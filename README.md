# snappy-snaps

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/i-like-robots/snappy-snaps/blob/main/LICENSE) ![build status](https://github.com/i-like-robots/snappy-snaps/actions/workflows/test.yml/badge.svg?branch=main) [![npm version](https://img.shields.io/npm/v/snappy-snaps.svg?style=flat)](https://www.npmjs.com/package/snappy-snaps)

Snappy Snaps is a tiny snapshot testing tool which can be used with any test framework and is able to serialize almost anything.

```js
import snap from 'snappy-snaps'

const data = fetchDogs()
const expected = await snap('Dogs', data) 

deepEqual(data, expected)
```

## Installation

This is a [Node.js] module available through the [npm] registry. Node.js 18 or higher is required.

```sh
$ npm install --save-dev snappy-snaps
```

_Please note_ this package is [ESM](https://nodejs.org/api/esm.html) only.

[Node.js]: https://nodejs.org/en/
[npm]: https://www.npmjs.com/
[npm install]: https://docs.npmjs.com/getting-started/installing-npm-packages-locally


## Usage

The purpose of snapshot testing is to ensure that the output of a piece of code remains the same over time. The first time your test code is run the data passed to the `snap()` function will be stored in a file on disk. On subsequent test runs the data will be retrieved from the file, enabling you to test if your code output is the same as the previously stored value.

```js
import { test } from 'node:test'
import assert from 'node:assert'
import snap from 'snappy-snaps'
 
const fetchDog = (id) => fetch(`/api/dogs/${id}`).then((res) => res.json())
 
test('Fetch dog data', async () => {
  const dog = await fetchDog('Rover')
  const expected = await snap('Rover', dog)

  assert.deepEqual(dog, expected)
})
```

Snappy snaps uses [`serialize-javascript`](https://github.com/yahoo/serialize-javascript) to serialize and store values rather than `JSON.stringify()` so it supports a wider range of data types including dates, maps, sets, functions, and regular expressions.

This package does not include any tooling for writing assertions or comparing your data, for this you could use Node's own [`assert`](https://nodejs.org/api/assert.html) module, a package such as [`fast-deep-equal`](https://github.com/epoberezkin/fast-deep-equal) or an assertion library like [Chai](https://www.npmjs.com/package/chai).

The created snapshots should be committed with your other code changes, and reviewed as part of your code review process. If you'd like to learn more, Browserstack maintain [a detailed guide to snapshot testing](https://www.browserstack.com/guide/snapshot-testing).

### Updating snapshots

You can update your snapshots by running your test command with a `--updateSnapshot` or `-u` flag, by deleting the snapshot file, or using the `update` option.

### Expiring snapshots

To be reminded to update your snapshots periodically you can set a future expiry date using the `expires` option and providing a timestamp. Running a test after the expiry date will output a warning.

```js
const ONE_YEAR = 1000 * 60 * 60 * 24 * 365
snap('name', data, { expires: Date.now() + ONE_YEAR })
```

## API

### snap(key, value, [options] = {})

Returns A promise that is fulfilled with the new or previously stored value.

#### key

A unique name to identify the snapshot.

#### value

A serializable value to be stored.

#### options

Configuration options for the snapshot.

## Credits

This plugin was based on the [`data-snapshot`](https://www.npmjs.com/package/data-snapshot) package and [snapshot implementation](https://github.com/vitest-dev/vitest/tree/76607ead169733f27e241554bca01f10e81ea849/packages/snapshot/src) from the Vitest test framework.

## License

This package is MIT licensed.
