import { describe, it, expect, beforeEach } from 'vitest'
import type { Db } from '../db/client'
import { createTestDb } from '../db/testDb'
import type { RepoData } from '../types/repo'
import { createRepoStore } from './repoStore'

describe('createRepoStore', () => {
  const repoData: RepoData = { owner: 'YorkMerrick', repo: 'labweekSpring2026' }
  const syncedAt = '2026-03-10T00:00:00.000Z'

  let db: Db
  let store: ReturnType<typeof createRepoStore>

  beforeEach(() => {
    db = createTestDb()
    store = createRepoStore(db)
  })

  it('returns the same id when the same repo is upserted twice', () => {
    const first = store.upsertRepo(repoData, syncedAt)
    const second = store.upsertRepo(repoData, '2026-03-11T00:00:00.000Z')

    expect(second).toBe(first)
  })

  it('gives different repos different ids', () => {
    const first = store.upsertRepo(repoData, syncedAt)
    const second = store.upsertRepo({ owner: repoData.owner, repo: 'otherRepo' }, syncedAt)

    expect(second).not.toBe(first)
  })

  it('treats the same repo name under a different owner as distinct', () => {
    const first = store.upsertRepo(repoData, syncedAt)
    const second = store.upsertRepo({ owner: 'someoneElse', repo: repoData.repo }, syncedAt)

    expect(second).not.toBe(first)
  })

  it('finds the id of a stored repo', () => {
    const id = store.upsertRepo(repoData, syncedAt)

    expect(store.findRepoId(repoData)).toBe(id)
  })

  it('returns undefined for an unknown repo', () => {
    expect(store.findRepoId(repoData)).toBeUndefined()
  })
})
