import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
import { resolve } from 'path';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1591210263498_7989';

  // add your egg config in here
  config.middleware = [];

  // view
  config.view = {
    defaultExtension: '.ejs',
    mapping: {
      '.ejs': 'ejs',
    },
  }

  // add your special config in here
  const bizConfig = {
    database: resolve(__dirname, '../data/database.db'),
    url: 'https://cdn.sylibs.com/g/',
    npmUrl: ''
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
