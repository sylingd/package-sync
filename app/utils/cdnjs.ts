import fetch from 'node-fetch';
import { SearchItem } from './var';

const url = 'https://api.cdnjs.com/libraries';

export async function search(name: string): Promise<SearchItem[]> {
  const result = await fetch(`${url}?fields=version,author,homepage&search=${encodeURIComponent(name)}`);
  const json = await result.json();
  return json.results;
}

interface Assets {
  version: string;
  files: string[];
}
async function getAssets(name: string): Promise<Assets[]> {
  const result = await fetch(`${url}/${encodeURIComponent(name)}?fields=assets`);
  const json = await result.json();

  return json.assets;
}

export async function versions(name: string): Promise<string[]> {
  const assets = await getAssets(name);

  return assets.map(it => it.version);
}

export async function files(name: string, version: string) {
  const assets = await getAssets(name);
  const matches = assets.filter(it => it.version === version);

  if (matches.length === 0) {
    return [];
  }

  return matches[0].files;
}