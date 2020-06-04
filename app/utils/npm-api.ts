import fetch from 'node-fetch';
import { SearchItem } from './var';

export async function search(name: string): Promise<SearchItem[]> {
  const result = await fetch(`https://registry.npmjs.com/-/v1/search?text=${encodeURIComponent(name)}&size=60`);
  const json = await result.json();
  return json.objects.map((it: any) => {
    // console.log(it);
    return {
      name: it.package.name,
      version: it.package.version,
      homepage: it.package.links.npm,
      author: it.package.maintainers ? it.package.maintainers.map((it: any) => it.username) : []
    }
  });
}

export async function versions(name: string): Promise<string[]> {
  const result = await fetch(`https://data.jsdelivr.com/v1/package/npm/${name}`);
  const json = await result.json();
  // console.log(json);

  return json.versions;
}

export async function files(name: string, version: string): Promise<string[]> {
  const result = await fetch(`https://data.jsdelivr.com/v1/package/npm/${name}@${version}/flat`);
  const json = await result.json();

  return json.files.map((it: any) => it.name.replace(/^\//, ''));
}