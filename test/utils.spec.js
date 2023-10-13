import { describe, it } from 'node:test'
import assert from 'node:assert'
import * as subject from '../lib/utils.js'

describe('lib/utils', () => {
  describe('.escapeBacktickString()', () => {
    it('escapes back ticks', () => {
      assert.equal(subject.escapeBacktickString('`foo`'), '\\`foo\\`')
    })

    it('escapes template characters', () => {
      assert.equal(subject.escapeBacktickString('${foo}'), '\\${foo}')
    })

    it('escapes template characters', () => {
      assert.equal(subject.escapeBacktickString(`\${foo}`), '\\${foo}')
    })
  })
})
