import { createDb, type Db } from './client.js'
import { runMigrations } from './migrate.js'

// A throwaway in-memory database with the real migrations applied, so tests
// exercise the same schema the pipeline runs against.
function createTestDb(): Db {
  const db = createDb(':memory:')
  runMigrations(db)
  return db
}

export { createTestDb }
