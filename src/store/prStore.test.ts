import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestDb, type TestDb } from '../db/testDb'
import type { Comment, PR, RepoData } from '../types/repo'
import { createPrStore } from './prStore'

describe('createPrStore', () => {
  const repoData: RepoData = { owner: 'owner', repo: 'repo' }
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

  let db: TestDb
  let store: ReturnType<typeof createPrStore>

  beforeEach(() => {
    db = createTestDb()
    store = createPrStore(db)
  })

  afterEach(async () => {
    await db.destroy()
  })

  it('stores and finds a PR by repo and number', async () => {
    await store.upsertPrs(repoData, [pr])

    expect(await store.findPr(repoData, pr.number)).toEqual({
      ...pr,
      reviewsSyncedForLastUpdated: null,
      reviewsSyncedAt: null,
      reviews: [],
    })
  })

  it('returns undefined for an unknown PR', async () => {
    expect(await store.findPr(repoData, 999)).toBeUndefined()
  })

  it('preserves null author details', async () => {
    await store.upsertPrs(repoData, [{ ...pr, authorName: null, authorEmail: null }])

    expect(await store.findPr(repoData, pr.number)).toMatchObject({
      authorName: null,
      authorEmail: null,
    })
  })

  it('updates mutable fields on re-upsert', async () => {
    await store.upsertPrs(repoData, [pr])
    await store.upsertPrs(repoData, [
      { ...pr, title: 'Renamed', lastUpdated: '2026-03-09T12:00:00Z' },
    ])

    expect(await store.findPr(repoData, pr.number)).toMatchObject({
      title: 'Renamed',
      lastUpdated: '2026-03-09T12:00:00Z',
    })
  })

  it('keeps stored reviews and the sync marker when a PR is re-upserted', async () => {
    const reviews: Comment[] = [{ id: 101, author: 'alice', body: 'Overview' }]

    await store.upsertPrs(repoData, [pr])
    const stored = await store.findPr(repoData, pr.number)
    await store.saveReviews(repoData, stored!, reviews, syncedAt)

    await store.upsertPrs(repoData, [pr])

    // A read-modify-write that dropped these would defeat the whole layer.
    expect(await store.findPr(repoData, pr.number)).toMatchObject({
      reviewsSyncedForLastUpdated: pr.lastUpdated,
      reviews,
    })
  })

  it('records the revision reviews were synced for', async () => {
    await store.upsertPrs(repoData, [pr])
    const stored = await store.findPr(repoData, pr.number)

    await store.saveReviews(repoData, stored!, [], syncedAt)

    expect(await store.findPr(repoData, pr.number)).toMatchObject({
      reviewsSyncedForLastUpdated: pr.lastUpdated,
      reviewsSyncedAt: syncedAt,
      reviews: [],
    })
  })

  it('preserves review order even when ids are not ascending', async () => {
    // The mapper uses the first review as the PR overview, so order matters.
    const unordered: Comment[] = [
      { id: 300, author: 'alice', body: 'Overview' },
      { id: 100, author: 'bob', body: 'Follow-up' },
      { id: 200, author: 'carol', body: 'Another' },
    ]

    await store.upsertPrs(repoData, [pr])
    const stored = await store.findPr(repoData, pr.number)
    await store.saveReviews(repoData, stored!, unordered, syncedAt)

    expect((await store.findPr(repoData, pr.number))?.reviews).toEqual(unordered)
  })

  it('scopes reviews to their own PR', async () => {
    const shared: Comment[] = [{ id: 101, author: 'alice', body: 'Overview' }]

    await store.upsertPrs(repoData, [pr, { ...pr, number: 8 }])
    const first = await store.findPr(repoData, pr.number)
    await store.saveReviews(repoData, first!, shared, syncedAt)

    // Same review id under a different PR must not collide or leak.
    const second = await store.findPr(repoData, 8)
    await store.saveReviews(repoData, second!, shared, syncedAt)

    expect((await store.findPr(repoData, pr.number))?.reviews).toEqual(shared)
    expect((await store.findPr(repoData, 8))?.reviews).toEqual(shared)
  })

  it('keeps PRs of the same number in different repos separate', async () => {
    await store.upsertPrs(repoData, [pr])
    await store.upsertPrs({ owner: 'owner', repo: 'other' }, [{ ...pr, title: 'Elsewhere' }])

    expect((await store.findPr(repoData, pr.number))?.title).toBe(pr.title)
    expect((await store.findPr({ owner: 'owner', repo: 'other' }, pr.number))?.title).toBe(
      'Elsewhere'
    )
  })

  it('handles an empty PR list', async () => {
    await expect(store.upsertPrs(repoData, [])).resolves.toBeUndefined()
  })
})
