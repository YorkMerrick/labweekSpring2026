import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { createDb, type Db } from './client.js'

type TestDb = Db & { path: string; destroy: () => Promise<void> }

// LevelDB locks its directory exclusively, so each test gets its own throwaway
// directory rather than a shared in-memory handle.
function createTestDb(): TestDb {
  const path = mkdtempSync(join(tmpdir(), 'digest-test-'))
  const db = createDb(path)

  return {
    ...db,
    path,
    destroy: async () => {
      await db.close()
      rmSync(path, { recursive: true, force: true })
    },
  }
}

export { createTestDb, type TestDb }
