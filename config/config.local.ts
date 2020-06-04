import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {
    sync: {
      type: 'local',
      target: 'Z:/test/'
    }
  };
  return config;
};
