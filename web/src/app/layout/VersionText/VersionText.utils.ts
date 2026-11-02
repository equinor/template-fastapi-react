import type { CommitInfo } from './VersionText.types'

export const EMPTY_COMMIT_INFO: CommitInfo = { hash: '', date: '', refs: '' }

/** Parse `key: value` lines from `version.txt`. Lines that don't match are ignored. */
export const parseVersionFile = (text: string): CommitInfo => {
  const entries = text
    .split('\n')
    .map((line): [string, string] | null => {
      // Split only on the first ": " so values may contain their own
      // (e.g. `refs: v1.2.3, tag: v1.2` when a commit has several tags).
      const separatorIndex = line.indexOf(': ')
      if (separatorIndex <= 0) return null
      return [line.slice(0, separatorIndex), line.slice(separatorIndex + 2)]
    })
    .filter((entry): entry is [string, string] => entry !== null)
  return { ...EMPTY_COMMIT_INFO, ...Object.fromEntries(entries) }
}
