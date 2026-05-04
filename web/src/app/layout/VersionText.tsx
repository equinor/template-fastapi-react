import { Typography } from '@equinor/eds-core-react'
import { useEffect, useState } from 'react'
import { ENV } from '@/config/env'

type CommitInfo = {
  hash: string
  date: string
  refs: string
}

const EMPTY_COMMIT_INFO: CommitInfo = { hash: '', date: '', refs: '' }

/** Parse `key: value` lines from `version.txt`. Lines that don't match are ignored. */
const parseVersionFile = (text: string): CommitInfo => {
  const entries = text
    .split('\n')
    .map((line) => line.split(': '))
    .filter((parts): parts is [string, string] => parts.length === 2 && parts[0].length > 0)
  return { ...EMPTY_COMMIT_INFO, ...Object.fromEntries(entries) }
}

const useCommitInfo = () => {
  const [commitInfo, setCommitInfo] = useState<CommitInfo>(EMPTY_COMMIT_INFO)

  useEffect(() => {
    fetch('version.txt')
      .then((res) => {
        if (!res.ok) throw new Error(`Could not read version file, ${res.statusText}`)
        return res.text()
      })
      .then((text) => setCommitInfo(parseVersionFile(text)))
      .catch(() => setCommitInfo(EMPTY_COMMIT_INFO))
  }, [])

  return commitInfo
}

export const VersionText = () => {
  const commitInfo = useCommitInfo()
  const label = commitInfo.refs || commitInfo.hash || 'unknown'

  return (
    <p>
      Version:{' '}
      <Typography link href={`${ENV.repoUrl}/commit/${commitInfo.hash}`}>
        {label}
      </Typography>{' '}
      {commitInfo.date}
    </p>
  )
}
