import { Controller } from 'egg';

export default class TestController extends Controller {
  async index() {
    const { ctx } = this
    const { id } = ctx.params
    const { query, body } = ctx.request
    const { baseUrl } = ctx.app.config
    const res = await this.app.axiosInstance.get('/api/breeds/image/random')
    console.log(res)
    const resp = {
      query,
      id,
      body,
      baseUrl
    }
    ctx.helper.success({ ctx, res: resp })
  }
  async getDog() {
    const { ctx, service } = this
    const resp = await service.dog.show()
    await ctx.render('test.nj', { url: resp.message })
  }
}