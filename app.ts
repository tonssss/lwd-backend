import { IBoot, Application } from 'egg'

export default class AppBoot implements IBoot {
  private readonly app: Application
  constructor(app: Application) {
    this.app = app
  }
  configWillLoad() {
    this.app.config.coreMiddleware.unshift('myLogger')
  }
}
