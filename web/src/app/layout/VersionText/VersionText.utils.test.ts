import { describe, expect, test } from 'vitest'
import { EMPTY_COMMIT_INFO, parseVersionFile } from './VersionText.utils'

describe('parseVersionFile', () => {
  test('parses key: value lines', () => {
    expect(parseVersionFile('hash: abc123\ndate: 2026-05-04\nrefs: v1.2.3')).toEqual({
      hash: 'abc123',
      date: '2026-05-04',
      refs: 'v1.2.3',
    })
  })

  test('splits only on the first colon-space so values may contain their own', () => {
    // `git log --format=%d` lists every tag, e.g. "v1.2.3, tag: v1.2".
    expect(parseVersionFile('hash: abc123\nrefs: v1.2.3, tag: v1.2')).toEqual({
      ...EMPTY_COMMIT_INFO,
      hash: 'abc123',
      refs: 'v1.2.3, tag: v1.2',
    })
  })

  test('ignores lines without a colon-space separator', () => {
    expect(parseVersionFile('not a valid line')).toEqual(EMPTY_COMMIT_INFO)
  })

  test('ignores lines with an empty key', () => {
    expect(parseVersionFile(': no key')).toEqual(EMPTY_COMMIT_INFO)
  })
})
