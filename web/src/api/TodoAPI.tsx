import { Configuration, TodosApi } from './generated'

export class TodoAPI extends TodosApi {
  constructor(token: string, basePath: string = 'http://localhost') {
    const configuration = new Configuration({
      basePath: basePath,
      accessToken: token,
    })
    super(configuration)
  }
}

export default TodoAPI
