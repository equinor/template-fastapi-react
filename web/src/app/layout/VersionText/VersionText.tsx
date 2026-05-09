import { Typography } from '@equinor/eds-core-react'
import { useEffect, useState } from 'react'
import { ENV } from '@/config/env'
import type { CommitInfo } from './VersionText.types'
import { EMPTY_COMMIT_INFO, parseVersionFile } from './VersionText.utils'

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
