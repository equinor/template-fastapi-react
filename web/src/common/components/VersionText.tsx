import { Typography } from '@equinor/eds-core-react'
import { useEffect, useState } from 'react'

type CommitInfo = {
  hash: string
  date: string
  refs: string
}

const useCommitInfo = () => {
  const [commitInfo, setCommitInfo] = useState<CommitInfo>({
    hash: '',
    date: '',
    refs: '',
  })

  useEffect(() => {
    const fetchVersionFile = () =>
      fetch('version.txt')
        .then((res) => {
          if (!res.ok) throw new Error(`Could not read version file, ${res.statusText}`)
          return res.text()
        })
        .then((text) => Object.fromEntries(text.split('\n').map((line) => line.split(': '))))
    fetchVersionFile().then((commitInfo) => setCommitInfo(commitInfo))
  }, [])

  return commitInfo
}

export const VersionText = () => {
  const commitInfo = useCommitInfo()

  return (
    <p>
      Version:{' '}
      <>
        <Typography link href={`https://github.com/equinor/template-fastapi-react/commit/${commitInfo.hash}`}>
          {commitInfo.refs === '' ? commitInfo.hash : commitInfo.refs}
        </Typography>{' '}
        {commitInfo.date}
      </>
    </p>
  )
}
