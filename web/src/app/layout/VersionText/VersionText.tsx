import { Typography } from '@equinor/eds-core-react'
import { useEffect, useState } from 'react'
import { ENV } from '@/config/env'
import type { CommitInfo } from './VersionText.types'
import { EMPTY_COMMIT_INFO, parseVersionFile } from './VersionText.utils'

export const VersionText = () => {
  const [commitInfo, setCommitInfo] = useState<CommitInfo>(EMPTY_COMMIT_INFO)

  useEffect(() => {
    // Base-relative path: a plain relative fetch resolves against the
    // current route's URL, so it would 404 (or hit the SPA fallback) on
    // nested routes. `BASE_URL` already ends with a slash.
    fetch(`${import.meta.env.BASE_URL}version.txt`)
      .then((res) => {
        if (!res.ok) throw new Error(`Could not read version file, ${res.statusText}`)
        return res.text()
      })
      .then((text) => setCommitInfo(parseVersionFile(text)))
      .catch(() => setCommitInfo(EMPTY_COMMIT_INFO))
  }, [])

  const label = commitInfo.refs || commitInfo.hash || 'unknown'

  return (
    <p>
      Version:{' '}
      {commitInfo.hash ? (
        <Typography link href={`${ENV.repoUrl}/commit/${commitInfo.hash}`}>
          {label}
        </Typography>
      ) : (
        <span>{label}</span>
      )}{' '}
      {commitInfo.date}
    </p>
  )
}
