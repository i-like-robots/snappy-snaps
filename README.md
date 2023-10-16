# snappy-snaps

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/i-like-robots/snappy-snaps/blob/main/LICENSE) ![build status](https://github.com/i-like-robots/snappy-snaps/actions/workflows/test.yml/badge.svg?branch=main) [![npm version](https://img.shields.io/npm/v/snappy-snaps.svg?style=flat)](https://www.npmjs.com/package/snappy-snaps)

A tiny utility to save and retrieve snapshots when testing. Works with any testing framework.

```js
import snap from 'snappy-snaps'
import assert from 'node:assert'

const data = fetchDogs()
const expected = snap('Dogs data', data) 

assert.deepEquals(expected, data)
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

The purpose of snapshot testing is to ensure that the output of a piece of code remains the same over time. The first time your test code is run the data passed to the `snap()` function will be stored in a file. On subsequent test runs the data will be retrieved from the file, enabling you to test if your code output is the same as the previously stored value.

```js
import { test } from 'node:test'
import assert from 'node:assert'
import snap from 'snappy-snaps'
 
const fetchData = (id) => fetch(`/api/dogs/${id}`).then((res) => res.json())
 
test('Your API', async () => {
  const dog = await fetchData('Rover')
  const expected = await snap('Rover', dog)

  assert.deepEquals(expected, dog)
})
```

Snappy snaps uses [`serialize-javascript`](https://github.com/yahoo/serialize-javascript) to store values and not `JSON.stringify()` so it supports a wider range of data types including dates, maps, sets, functions, and regular expressions.

The created snapshots should be committed with your other code changes, and reviewed as part of your code review process. If you'd like to learn more, Browserstack maintain [a detailed guide to snapshot testing](https://www.browserstack.com/guide/snapshot-testing).

### Updating snapshots

You can update your snapshots by running your test command with a `--updateSnapshot` or `-u` flag or by deleting the snapshot file.

### Expiry

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

Configuration options for the snapshot. Optional.

## License

This package is MIT licensed.
