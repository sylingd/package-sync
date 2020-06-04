import Downloader from '../utils/downloader';
import { resolve } from 'path';
import { Controller } from 'egg';

class SyncController extends Controller {
  async do() {
    const { ctx, config } = this;

    const isNpm = ctx.request.query.type === 'npm';
    
    const handler = isNpm ? Downloader.npm : Downloader.cdnjs;
    const name = ctx.request.query.name;
    const version = ctx.request.query.version;
    const pattern = ctx.request.query.pattern;

    // 拼接最终目录
    const output = resolve(config.sync.target, isNpm ? 'npm' : 'cdnjs', name, version);

    try {
      await handler(name, version, output, pattern);

      // TODO: 上传到第三方路径
      ctx.body = {
        success: true
      };
    } catch (e) {
      console.log(e);
      ctx.body = {
        success: false,
        error: e
      };
    }
  }
}

module.exports = SyncController;