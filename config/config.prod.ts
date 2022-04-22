import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {};
  config.baseUrl = 'prod.url'
  config.myLogger = {
    allowedMethod: [ '' ]
  }
  return config;
};
