import * as decompress from 'decompress';
import { copyFile, stat, writeFile } from 'fs-extra';
import * as globAsync from 'glob';
import { tmpdir } from 'os';
import { dirname, resolve as resolvePath } from 'path';
import { v4 as uuid } from 'uuid';
import { fetch, mkdirs, rmdirs } from '.';
import * as cdnjs from './cdnjs';

function glob(pattern: string, options: any): Promise<string[]> {
  return new Promise((resolve, reject) => {
    globAsync(pattern, options, (err, matches) => {
      if (err) reject(err);
      else resolve(matches);
    });
  });
}

// 不要同时并行太多，防止阻塞
const downloadQueue: {
  url: string;
  output: string;
  callback: () => void;
}[] = [];
async function downloadOne(url: string, output: string, maxRetry = 3) {
  // console.log("downloadOne", url)
  try {
    const content = await fetch(url);
    const buffer = await content.buffer();
    await mkdirs(dirname(output));
    await writeFile(output, buffer);
  } catch (e) {
    if (maxRetry > 0) {
      return await downloadOne(url, output, maxRetry - 1);
    } else {
      throw e;
    }
  }
  // console.log("download success", url)
}
let downloading = 0;
async function downloadNext() {
  if (downloading > 5) {
    return;
  }
  const item = downloadQueue.pop();
  if (item) {
    downloading++;
    await downloadOne(item.url, item.output);
    item.callback();
    downloading--;
  }
  if (downloadQueue.length > 0) {
    downloadNext();
  }
}
function downloadSingleFile(url: string, output: string) {
  return new Promise(resolve => {
    // console.log("new download task", url)
    downloadQueue.push({
      url,
      output,
      callback: resolve
    });
    downloadNext()
  });
}

class Downloader {
  async cdnjs(name: string, version: string, output: string) {
    const files = await cdnjs.files(name, version);
    // console.log("total files: " + files.length);

    const downloadQueue = files.map(fileName => {
      // https://cdnjs.cloudflare.com/ajax/libs/react/16.13.1/umd/react.development.js
      const url = `https://cdnjs.cloudflare.com/ajax/libs/${name}/${version}/${fileName}`;
      return downloadSingleFile(url, resolvePath(output, fileName));
    });

    return await Promise.all(downloadQueue);
  }

  async npm(name: string, version: string, output: string, pattern: string) {
    // 先下载到临时目录
    const tmp = resolvePath(tmpdir(), 'pkgsync', uuid());
    await mkdirs(tmp);
    // https://registry.npm.taobao.org/@babel/runtime/download/@babel/runtime-7.10.2.tgz
    const url = `https://registry.npm.taobao.org/${name}/download/${name}-${version}.tgz`
    const tgzPath = resolvePath(tmp, 'lib.tgz');
    await downloadSingleFile(url, tgzPath);
    // 解压出来之后，会自带一个package的子目录
    const unzipPath = resolvePath(tmp, 'package');
    await decompress(tgzPath, tmp);
    // 匹配出需要的文件
    const files = await glob(pattern, {
      cwd: unzipPath
    });
    if (files.length === 0) {
      throw new Error("No files");
    }
    // 复制文件
    const copyQueue = files.map(async it => {
      const fullPath = resolvePath(unzipPath, it);
      // 只处理文件
      const stats = await stat(fullPath);
      if (stats.isFile()) {
        const to = resolvePath(output, it);
        await mkdirs(dirname(to));
        await copyFile(fullPath, to);
      }
    });
    // 完成，清理垃圾
    await Promise.all(copyQueue);
    await rmdirs(tmp);
  }
}

export default new Downloader;