import { describe, it, expect, beforeEach } from 'vitest'
import type { Db } from '../db/client'
import { createTestDb } from '../db/testDb'
import type { PR } from '../types/repo'
import { createPrStore } from './prStore'
import { createRepoStore } from './repoStore'

describe('createPrStore', () => {
  const syncedAt = '2026-03-10T00:00:00.000Z'

  const pr: PR = {
    number: 7,
    title: 'Add caching layer',
    authorName: 'alice',
    authorEmail: 'alice@email.com',
    url: 'https://github.com/owner/repo/pull/7',
    createdAt: '2026-03-01T12:00:00Z',
    lastUpdated: '2026-03-02T12:00:00Z',
  }

  let db: Db
  let repoId: number
  let store: ReturnType<typeof createPrStore>

  beforeEach(() => {
    db = createTestDb()
    repoId = createRepoStore(db).upsertRepo({ owner: 'owner', repo: 'repo' }, syncedAt)
    store = createPrStore(db)
  })

  it('stores and finds a PR by repo and number', () => {
    store.upsertPrs(repoId, [pr])

    const stored = store.findPr(repoId, pr.number)

    expect(stored).toMatchObject({
      repoId,
      number: pr.number,
      title: pr.title,
      authorName: pr.authorName,
      authorEmail: pr.authorEmail,
      url: pr.url,
      createdAt: pr.createdAt,
      lastUpdated: pr.lastUpdated,
      reviewsSyncedForLastUpdated: null,
      reviewsSyncedAt: null,
    })
  })

  it('returns undefined for an unknown PR', () => {
    expect(store.findPr(repoId, 999)).toBeUndefined()
  })

  it('preserves null author details', () => {
    store.upsertPrs(repoId, [{ ...pr, authorName: null, authorEmail: null }])

    expect(store.findPr(repoId, pr.number)).toMatchObject({
      authorName: null,
      authorEmail: null,
    })
  })

  it('updates mutable fields on re-upsert without duplicating the row', () => {
    store.upsertPrs(repoId, [pr])
    store.upsertPrs(repoId, [{ ...pr, title: 'Renamed', lastUpdated: '2026-03-09T12:00:00Z' }])

    const stored = store.findPr(repoId, pr.number)

    expect(stored?.title).toBe('Renamed')
    expect(stored?.lastUpdated).toBe('2026-03-09T12:00:00Z')
  })

  it('keeps the review sync marker when a PR is re-upserted', () => {
    store.upsertPrs(repoId, [pr])
    const stored = store.findPr(repoId, pr.number)
    store.markReviewsSynced(stored!.id, pr.lastUpdated, syncedAt)

    store.upsertPrs(repoId, [pr])

    // Clobbering this on every list call would defeat the whole layer.
    expect(store.findPr(repoId, pr.number)?.reviewsSyncedForLastUpdated).toBe(pr.lastUpdated)
  })

  it('records the revision reviews were synced for', () => {
    store.upsertPrs(repoId, [pr])
    const stored = store.findPr(repoId, pr.number)

    store.markReviewsSynced(stored!.id, pr.lastUpdated, syncedAt)

    expect(store.findPr(repoId, pr.number)).toMatchObject({
      reviewsSyncedForLastUpdated: pr.lastUpdated,
      reviewsSyncedAt: syncedAt,
    })
  })

  it('handles an empty PR list', () => {
    expect(() => store.upsertPrs(repoId, [])).not.toThrow()
  })
})
