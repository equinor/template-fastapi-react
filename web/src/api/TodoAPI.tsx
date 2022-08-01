import { Configuration, TodosApi } from './generated'

export class TodoAPI extends TodosApi {
  constructor(token: string) {
    const configuration = new Configuration({
      basePath: 'http://localhost',
      accessToken: token,
    })
    super(configuration)
  }
}

export default TodoAPI
