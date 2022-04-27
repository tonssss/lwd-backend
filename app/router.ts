import { Application } from 'egg'

export default (app: Application) => {
  const { controller, router } = app
  // const logger = app.middleware.myLogger({
  //   allowedMethod: [ 'GET' ]
  // }, app)
  const jwtMiddleware = app.jwt as any
  router.get('/', controller.home.index)
  // router.get('/test/:id', controller.test.index)
  // router.post('/test/:id', controller.test.index)
  // router.get('/dogs', logger, controller.test.getDog)
  // users
  router.post('/api/users/create', controller.user.createByEmail)
  router.get('/api/users/cur', jwtMiddleware, controller.user.show)
  router.post('/api/users/login', controller.user.loginByEmail)
  router.post('/api/users/genVeriCode', controller.user.sendVeriCode)
  router.post('/api/users/loginByPhoneNumber', controller.user.loginByCellPhone)
  router.get('/api/users/passport/gitee', controller.user.oauth)
  router.get('/api/users/passport/gitee/callback', controller.user.oauthByGitee)
  // works
  router.post('/api/works', jwtMiddleware, controller.work.createWork)
  router.get('/api/works', jwtMiddleware, controller.work.myList)
  router.get('/api/templates', controller.work.templateList)
  router.patch('/api/works/:id', jwtMiddleware, controller.work.update)
  router.delete('/api/works/:id', jwtMiddleware, controller.work.delete)
  router.post('/works/publish/:id', controller.work.publishWork)
  router.post('/works/publish-template/:id', controller.work.publishTemplate)
}
