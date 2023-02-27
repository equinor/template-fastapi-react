import { Typography } from '@equinor/eds-core-react'
import axios, { AxiosError, AxiosResponse } from 'axios'
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
      axios
        .get('version.txt')
        .then((res: AxiosResponse<string>) =>
          Object.fromEntries(
            res.data.split('\n').map((line) => line.split(': '))
          )
        )
        .catch((error: AxiosError) => {
          throw new Error(
            `Could not read version file, ${error.response?.data ?? error}`
          )
        })
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
        <Typography
          link
          href={`https://github.com/equinor/template-fastapi-react/commit/${commitInfo.hash}`}
        >
          {commitInfo.refs === '' ? commitInfo.hash : commitInfo.refs}
        </Typography>{' '}
        {commitInfo.date}
      </>
    </p>
  )
}
