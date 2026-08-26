import { describe, it, expect, beforeEach } from 'vitest'
import type { Db } from '../db/client'
import { createTestDb } from '../db/testDb'
import type { Comment, PR } from '../types/repo'
import { createCommentStore } from './commentStore'
import { createPrStore } from './prStore'
import { createRepoStore } from './repoStore'

describe('createCommentStore', () => {
  const pr: PR = {
    number: 7,
    title: 'Add caching layer',
    authorName: 'alice',
    authorEmail: 'alice@email.com',
    url: 'https://github.com/owner/repo/pull/7',
    createdAt: '2026-03-01T12:00:00Z',
    lastUpdated: '2026-03-02T12:00:00Z',
  }

  const comments: Comment[] = [
    { id: 101, author: 'alice', body: 'First overview' },
    { id: 102, author: 'alice', body: 'Second overview' },
  ]

  let db: Db
  let prId: number
  let store: ReturnType<typeof createCommentStore>

  beforeEach(() => {
    db = createTestDb()
    const repoId = createRepoStore(db).upsertRepo(
      { owner: 'owner', repo: 'repo' },
      '2026-03-10T00:00:00.000Z'
    )
    const prStore = createPrStore(db)
    prStore.upsertPrs(repoId, [pr])
    prId = prStore.findPr(repoId, pr.number)!.id
    store = createCommentStore(db)
  })

  it('returns an empty list for a PR with no stored reviews', () => {
    expect(store.findCommentsForPr(prId)).toEqual([])
  })

  it('stores and returns reviews', () => {
    store.replaceCommentsForPr(prId, comments)

    expect(store.findCommentsForPr(prId)).toEqual(comments)
  })

  it('replaces previous reviews instead of appending', () => {
    store.replaceCommentsForPr(prId, comments)

    const replacement: Comment[] = [{ id: 103, author: 'bob', body: 'Only overview' }]
    store.replaceCommentsForPr(prId, replacement)

    expect(store.findCommentsForPr(prId)).toEqual(replacement)
  })

  it('clears stored reviews when replaced with an empty list', () => {
    store.replaceCommentsForPr(prId, comments)
    store.replaceCommentsForPr(prId, [])

    expect(store.findCommentsForPr(prId)).toEqual([])
  })

  it('returns reviews in the order they were stored', () => {
    // The mapper uses the first review as the PR's overview, so a cached read
    // has to preserve fetch order even when ids are not ascending.
    const unordered: Comment[] = [
      { id: 300, author: 'alice', body: 'Overview' },
      { id: 100, author: 'bob', body: 'Follow-up' },
      { id: 200, author: 'carol', body: 'Another' },
    ]

    store.replaceCommentsForPr(prId, unordered)

    expect(store.findCommentsForPr(prId)).toEqual(unordered)
  })

  it('is idempotent when storing the same reviews twice', () => {
    store.replaceCommentsForPr(prId, comments)
    store.replaceCommentsForPr(prId, comments)

    expect(store.findCommentsForPr(prId)).toEqual(comments)
  })

  it('does not return reviews belonging to another PR', () => {
    store.replaceCommentsForPr(prId, comments)

    const repoId = createRepoStore(db).findRepoId({ owner: 'owner', repo: 'repo' })!
    const prStore = createPrStore(db)
    prStore.upsertPrs(repoId, [{ ...pr, number: 8 }])
    const otherPrId = prStore.findPr(repoId, 8)!.id

    expect(store.findCommentsForPr(otherPrId)).toEqual([])
  })
})
