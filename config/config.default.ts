import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
import * as dovenv from 'dotenv'
dovenv.config()

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1650278033320_248';

  // add your egg config in here
  config.middleware = [ 'customError' ];

  config.security = {
    csrf: {
      enable: false
    }
  }
  config.view = {
    defaultViewEngine: 'nunjucks'
  }
  config.logger = {
    consoleLevel: 'DEBUG'
  }
  config.mongoose = {
    url: 'mongodb://localhost:27017/lego'
  }
  config.bcrypt = {
    saltRounds: 10
  }
  config.jwt = {
    secret: '1234567890'
  }
  config.redis = {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: '',
      db: 0
    }
  }
  config.cors = {
    origin: 'http://localhost:8080',
    allowMethods: 'GET,HEAD,PUT,OPTIONS,POST,DELETE,PATCH'
  }

  const aliCloudConfig = {
    // 您的AccessKey ID
    accessKeyId: process.env.ALC_ACCESS_KEY || '',
    // 您的AccessKey Secret
    accessKeySecret: process.env.ALC_SECRET_KEY || '',
    endpoint: 'dysmsapi.aliyuncs.com'
  }

  const giteeOauthConfig = {
    cid: process.env.GITEE_CID,
    secret: process.env.GITEE_SECRET,
    redirectURL: 'http://localhost:7001/api/users/passport/gitee/callback',
    authURL: 'https://gitee.com/oauth/token?grant_type=authorization_code',
    giteeUserAPI: 'https://gitee.com/api/v5/user'
  }

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
    myLogger: {
      allowedMethod: [ 'POST' ]
    },
    baseUrl: 'default.url',
    aliCloudConfig,
    giteeOauthConfig
  };

  // the return config will combines to EggAppConfig
  return {
    ...config as {},
    ...bizConfig,
  };
};
