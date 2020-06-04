import * as npm from '../utils/npm-api';
import * as cdnjs from '../utils/cdnjs';
import { Controller } from 'egg';

class ApiController extends Controller {
  async search() {
    const { ctx } = this;
    
    const handler = ctx.request.query.type === 'npm' ? npm.search : cdnjs.search;
    const name = ctx.request.query.name;

    const result = await handler(name);
    ctx.body = result;
  }

  async version() {
    const { ctx } = this;

    const handler = ctx.request.query.type === 'npm' ? npm.versions : cdnjs.versions;
    const name = ctx.request.query.name;

    const result = await handler(name);
    ctx.body = result;
  }

  async files() {
    const { ctx } = this;

    const handler = ctx.request.query.type === 'npm' ? npm.files : cdnjs.files;
    const name = ctx.request.query.name;
    const version = ctx.request.query.version;
  
    const result = await handler(name, version);
    ctx.body = result;
  }
}

module.exports = ApiController;