import { mkdirSync } from 'fs'
import { dirname } from 'path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.js'

const DEFAULT_DATABASE_PATH = './data/digest.db'

function createDatabase(path: string): Database.Database {
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true })
  }

  const sqlite = new Database(path)

  // Foreign keys are per-connection in SQLite, so enable them explicitly to
  // make the `onDelete: 'cascade'` relations in the schema actually fire.
  sqlite.pragma('foreign_keys = ON')

  if (path !== ':memory:') {
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('busy_timeout = 5000')
  }

  return sqlite
}

function createDb(path: string = process.env.DATABASE_PATH ?? DEFAULT_DATABASE_PATH) {
  return drizzle(createDatabase(path), { schema })
}

type Db = ReturnType<typeof createDb>

export { createDatabase, createDb, DEFAULT_DATABASE_PATH, type Db }
