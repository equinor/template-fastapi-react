import { Typography } from '@equinor/eds-core-react'
import axios, { AxiosResponse } from 'axios'
import { useEffect, useState } from 'react'

const useCommitInfo = () => {
  const [commitInfo, setCommitInfo] = useState<{ [key: string]: string }>({
    hash: '',
    date: '',
    refs: '',
  })

  useEffect(() => {
    axios.get('version.txt').then((response: AxiosResponse<string>) => {
      const versionFile: { [key: string]: string } = Object.fromEntries(
        response.data.split('\n').map((line) => line.split(': '))
      )
      setCommitInfo(versionFile)
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
