import type { CommitInfo } from './VersionText.types'

export const EMPTY_COMMIT_INFO: CommitInfo = { hash: '', date: '', refs: '' }

/** Parse `key: value` lines from `version.txt`. Lines that don't match are ignored. */
export const parseVersionFile = (text: string): CommitInfo => {
  const entries = text
    .split('\n')
    .map((line) => line.split(': '))
    .filter((parts): parts is [string, string] => parts.length === 2 && parts[0].length > 0)
  return { ...EMPTY_COMMIT_INFO, ...Object.fromEntries(entries) }
}
