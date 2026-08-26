import { fileURLToPath } from 'url'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { createDb, type Db } from './client.js'

// Resolves to the project root from both src/db (via tsx) and dist/db (built).
const MIGRATIONS_FOLDER = fileURLToPath(new URL('../../drizzle', import.meta.url))

function runMigrations(db: Db): void {
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER })
}

export { runMigrations, MIGRATIONS_FOLDER }

// Allow `npm run db:migrate` to apply migrations without starting the pipeline.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations(createDb())
  console.log('Migrations applied')
}
