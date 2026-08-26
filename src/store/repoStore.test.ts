import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestDb, type TestDb } from '../db/testDb'
import type { RepoData } from '../types/repo'
import { createRepoStore } from './repoStore'

describe('createRepoStore', () => {
  const repoData: RepoData = { owner: 'YorkMerrick', repo: 'labweekSpring2026' }
  const syncedAt = '2026-03-10T00:00:00.000Z'

  let db: TestDb
  let store: ReturnType<typeof createRepoStore>

  beforeEach(() => {
    db = createTestDb()
    store = createRepoStore(db)
  })

  afterEach(async () => {
    await db.destroy()
  })

  it('stores and finds a repo', async () => {
    await store.markSynced(repoData, syncedAt)

    expect(await store.findRepo(repoData)).toEqual({
      owner: repoData.owner,
      repo: repoData.repo,
      lastSyncedAt: syncedAt,
    })
  })

  it('returns undefined for an unknown repo', async () => {
    expect(await store.findRepo(repoData)).toBeUndefined()
  })

  it('refreshes the sync timestamp on a repeat sync', async () => {
    await store.markSynced(repoData, syncedAt)
    await store.markSynced(repoData, '2026-03-11T00:00:00.000Z')

    expect((await store.findRepo(repoData))?.lastSyncedAt).toBe('2026-03-11T00:00:00.000Z')
  })

  it('keeps different repos under the same owner separate', async () => {
    await store.markSynced(repoData, syncedAt)

    expect(await store.findRepo({ owner: repoData.owner, repo: 'otherRepo' })).toBeUndefined()
  })

  it('treats the same repo name under a different owner as distinct', async () => {
    await store.markSynced(repoData, syncedAt)

    expect(await store.findRepo({ owner: 'someoneElse', repo: repoData.repo })).toBeUndefined()
  })
})
