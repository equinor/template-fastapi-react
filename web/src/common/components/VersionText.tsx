import { Typography } from '@equinor/eds-core-react'
import axios, { AxiosResponse } from 'axios'
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
    axios.get('version.txt').then((response: AxiosResponse<string>) => {
      const versionFile: { [key: string]: string } = Object.fromEntries(
        response.data.split('\n').map((line) => line.split(': '))
      )
      setCommitInfo(versionFile as CommitInfo)
    })
  }, [])

  return commitInfo
}

export const VersionText = (): JSX.Element => {
  const commitInfo = useCommitInfo()

  return (
    <p>
      Version:{' '}
      {commitInfo.hash !== '' && commitInfo.date !== '' && (
        <>
          <Typography
            link
            href={`https://github.com/equinor/template-fastapi-react/commit/${commitInfo.hash}`}
          >
            {commitInfo.refs === '' ? commitInfo.hash : commitInfo.refs}
          </Typography>{' '}
          ({commitInfo.date})
        </>
      )}
    </p>
  )
}
