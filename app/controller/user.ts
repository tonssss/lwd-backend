import { Controller } from 'egg'
import inputValidate from '../decorator/inputValidate'

const userCreateRules = {
  username: 'email',
  password: { type: 'password', min: 8 }
}
const sendCodeRules = {
  phoneNumber: { type: 'string', format: /^1[3-9]\d{9}$/, message: '手机号码格式错误' }
}
const userPhoneCreateRules = {
  phoneNumber: { type: 'string', format: /^1[3-9]\d{9}$/, message: '手机号码格式错误' },
  veriCode: { type: 'string', format: /^\d{4}$/, message: '验证码格式错误' }
}

export default class UserController extends Controller {
  @inputValidate(userCreateRules, 'loginValidateFail')
  async createByEmail() {
    const { ctx, service } = this
    const { username } = ctx.request.body
    const user = await service.user.findByUsername(username)
    if (user) {
      return ctx.helper.error({ ctx, errorType: 'createUserAlreadyExists' })
    }
    const userData = await service.user.createByEmail(ctx.request.body)
    ctx.helper.success({ ctx, res: userData })
  }
  @inputValidate(sendCodeRules, 'userValidateFail')
  async sendVeriCode() {
    const { ctx, app } = this
    const { phoneNumber } = ctx.request.body
    // 获取redis 的数据
    const preVeriCode = await app.redis.get(`preVeriCode-${phoneNumber}`)
    // 判断是否存在
    if (preVeriCode) {
      return ctx.helper.error({ ctx, errorType: 'sendVeriCodeFrequentlyFailInfo' })
    }
    const veriCode = (Math.floor((Math.random() * 9000) + 1000)).toString()
    // 发送短信
    // 判断是否为生成环境
    if (app.config.env === 'prod') {
      const resp = await this.service.user.sendSMS(phoneNumber, veriCode)
      if (resp.body.code !== 'ok') {
        return ctx.helper.error({ ctx, errorType: 'sendVeriCodeError' })
      }
    }
    await app.redis.set(`preVeriCode-${phoneNumber}`, veriCode, 'ex', 60)
    ctx.helper.success({ ctx, msg: '验证码发送成功', res: app.config.env === 'local' ? { veriCode } : null })
  }
  @inputValidate(userCreateRules, 'loginValidateFail')
  async loginByEmail() {
    const { ctx, service, app } = this
    // 根据 username 取得用户信息
    const { username, password } = ctx.request.body
    const user = await service.user.findByUsername(username)
    // 检查用户是否存在
    if (!user) {
      return ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo' })
    }
    const verifyPwd = await ctx.compare(password, user.password)
    if (!verifyPwd) {
      return ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo' })
    }
    // 生成token
    const token = app.jwt.sign({ username: user.username, _id: user._id }, app.config.jwt.secret, { expiresIn: 60 * 60 })
    ctx.helper.success({ ctx, res: { token }, msg: '登录成功' })
  }
  @inputValidate(userPhoneCreateRules, 'userValidateFail')
  async loginByCellPhone() {
    const { ctx, app } = this
    const { phoneNumber, veriCode } = ctx.request.body
    // 验证码是否正确
    const preVeriCode = await app.redis.get(`preVeriCode-${phoneNumber}`)
    if (veriCode !== preVeriCode) {
      return ctx.helper.error({ ctx, errorType: 'loginVeriCodeIncorrectFailInfo' })
    }
    const token = await ctx.service.user.loginByCellphone(phoneNumber)
    ctx.helper.success({ ctx, res: { token } })
  }
  async oauth() {
    const { ctx, app } = this
    const { cid, redirectURL } = app.config.giteeOauthConfig
    ctx.redirect(`https://gitee.com/oauth/authorize?client_id=${cid}&redirect_uri=${redirectURL}&response_type=code`)
  }
  async oauthByGitee() {
    const { ctx } = this
    const { code } = ctx.request.query
    try {
      const token = await ctx.service.user.loginByGitee(code)
      await ctx.render('success.nj', { token })
      // ctx.helper.success({ ctx, res: { token } })
    } catch (e) {
      ctx.helper.error({ ctx, errorType: 'giteeOauthError' })
    }
  }
  async show() {
    const { ctx, service } = this
    const userData = await service.user.findByUsername(ctx.state.user.username)
    if (userData) {
      ctx.helper.success({ ctx, res: userData.toJSON() })
    }
  }
}
