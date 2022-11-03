import { Link } from 'react-router-dom'

const InvalidUrl = () => {
  return (
    <div style={{ margin: '40px', textAlign: 'center' }}>
      <p>Invalid url. Please go back to the: </p>
      <Link to={''}>home page</Link>
    </div>
  )
}

export default InvalidUrl
