import { mkdir, pathExists, readdir, rmdir, stat, unlink } from 'fs-extra';
import nodeFetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import { resolve as resolvePath } from 'path';

const makingQueue: { [x: string]: any[] } = {};
export function mkdirs(path: string) {
  return new Promise(async (resolve) => {
    // 如果已经在队列中了，就当做一切ok
    if (typeof makingQueue[path] !== 'undefined') {
      // console.log(`${path} exists`);
      makingQueue[path].push(resolve);
      return;
    } else {
      makingQueue[path] = [];
      makingQueue[path].push(resolve);
    }

    const resolveAll = () => {
      while (true) {
        const cb = makingQueue[path].pop();
        if (cb) cb();
        else break;
      }
      delete makingQueue[path];
    }

    const exist = await pathExists(path);
    // console.log("mkdirs", path, exist);
    if (exist) {
      resolveAll();
      return;
    }
    const parent = resolvePath(path, '..');
    await mkdirs(parent);
    await mkdir(path);
    resolveAll();
  });
}

export function rmdirs(path: string) {
  return new Promise(async (resolve) => {
    const exist = await pathExists(path);
    if (!exist) {
      resolve();
      return;
    }
    
    const files = await readdir(path);

    const delFiles = files.map(async (it: string) => {
      const fullPath = resolvePath(path, it);

      const stats = await stat(fullPath);
      if (stats.isFile()) {
        await unlink(fullPath);
      } else {
        await rmdirs(fullPath);
      }
    });

    // 把自己删掉
    await Promise.all(delFiles);
    await rmdir(path);

    resolve();
  });
}

export function wait(time: number, data?: any): Promise<any> {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), time);
  });
}

export function fetch(url: RequestInfo, init?: RequestInit, timeout = 10000): Promise<Response> {
  return new Promise((resolve, reject) => {
    Promise.race<Response | undefined>([
      wait(timeout),
      nodeFetch(url, init)
    ])
      .then(res => {
        if (typeof res === 'undefined') {
          reject(new Error("Timeout"));
        } else {
          resolve(res);
        }
      });
  })
}