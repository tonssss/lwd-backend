import { Application } from 'egg'

export default (app: Application) => {
  const { controller, router } = app
  // const logger = app.middleware.myLogger({
  //   allowedMethod: [ 'GET' ]
  // }, app)
  router.get('/', controller.home.index)
  // router.get('/test/:id', controller.test.index)
  // router.post('/test/:id', controller.test.index)
  // router.get('/dogs', logger, controller.test.getDog)
  router.post('/api/users/create', controller.user.createByEmail)
  router.get('/api/users/cur', app.jwt as any, controller.user.show)
  router.post('/api/users/login', controller.user.loginByEmail)
  router.post('/api/users/genVeriCode', controller.user.sendVeriCode)
  router.post('/api/users/loginByPhoneNumber', controller.user.loginByCellPhone)
  router.get('/api/users/passport/gitee', controller.user.oauth)
  router.get('/api/users/passport/gitee/callback', controller.user.oauthByGitee)
}
