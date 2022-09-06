import { Configuration, TodosApi } from './generated'

export class TodoAPI extends TodosApi {
  constructor(token: string) {
    const configuration = new Configuration({
      // @ts-ignore
      basePath: window.location.origin,
      accessToken: token,
    })
    super(configuration)
  }
}

export default TodoAPI
