import { EggApplication } from 'egg';
import { Database } from 'sqlite';
import { Database as Sqlite3Database, Statement } from 'sqlite3';

export interface SearchItem {
  name: string;
  author: string;
  version: string;
  homepage: string;
}

export interface MyApp extends EggApplication {
  db: Database<Sqlite3Database, Statement>;
}