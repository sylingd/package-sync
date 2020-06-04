import { copyFile, pathExists } from 'fs-extra';
import { dirname, resolve } from 'path';
import { open } from 'sqlite';
import { Database } from 'sqlite3';
import { mkdirs } from './app/utils';
import { MyApp } from './app/utils/var';

class AppBootHook {
  private app: MyApp;

  constructor(app: MyApp) {
    this.app = app;
  }

  async didLoad() {
    // 所有的配置已经加载完毕
    // 如果是第一次运行，就把数据库复制过去
    const hasDatabase = await pathExists(this.app.config.database);
    if (!hasDatabase) {
      await mkdirs(dirname(this.app.config.database));
      await copyFile(resolve(__dirname, 'database.db'), this.app.config.database);
    }
    // 启动数据库实例
    this.app.db = await open({
      filename: this.app.config.database,
      driver: Database
    });
  }
}

module.exports = AppBootHook;