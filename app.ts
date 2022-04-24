import { IBoot, Application } from 'egg'
import { join } from 'path'

export default class AppBoot implements IBoot {
  private readonly app: Application
  constructor(app: Application) {
    this.app = app
  }
  configWillLoad() {
    this.app.config.coreMiddleware.unshift('myLogger')
  }
  async willReady() {
    const dir = join(this.app.config.baseDir, 'app/model')
    this.app.loader.loadToApp(dir, 'model', {
      caseStyle: 'upper'
    })
  }
  async didReady() {
    const ctx = await this.app.createAnonymousContext()
    const res = await ctx.service.test.sayHi('viking')
    console.log('res', res)
    console.log('final mid', this.app.middleware)
  }
}
