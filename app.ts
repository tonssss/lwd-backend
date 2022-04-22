import { IBoot, Application } from 'egg'

export default class AppBoot implements IBoot {
  private readonly app: Application
  constructor(app: Application) {
    this.app = app
  }
  configWillLoad() {
    this.app.config.coreMiddleware.unshift('myLogger')
  }
  async didReady() {
    const ctx = await this.app.createAnonymousContext()
    const res = await ctx.service.test.sayHi('viking')
    console.log('res', res)
    console.log('final mid', this.app.middleware)
  }
}
