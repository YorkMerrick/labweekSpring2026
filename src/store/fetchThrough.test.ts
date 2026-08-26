import { describe, it, expect, vi, afterEach } from 'vitest'
import type { Db } from '../db/client'
import { createTestDb } from '../db/testDb'
import { PipelineService, type CommentFetcher } from '../service/pipelineService'
import type { Comment, PR, RepoData } from '../types/repo'
import { createStoredFetchers } from './fetchThrough'

describe('createStoredFetchers', () => {
  const repoData: RepoData = { owner: 'YorkMerrick', repo: 'labweekSpring2026' }

  const pr: PR = {
    number: 1,
    title: 'Add caching layer',
    authorName: 'alice',
    authorEmail: 'alice@email.com',
    url: 'https://github.com/owner/repo/pull/1',
    createdAt: '2026-03-01T12:00:00Z',
    lastUpdated: '2026-03-02T12:00:00Z',
  }

  const comments: Comment[] = [{ id: 101, author: 'alice', body: 'Copilot overview' }]

  // Mirrors the order PipelineService calls the fetchers in: list the PRs for a
  // repo, then fetch reviews for each one.
  async function run(db: Db, prs: PR[], commentFetcher: CommentFetcher) {
    const stored = createStoredFetchers(db, async () => prs, commentFetcher)
    const fetchedPrs = await stored.prFetcher(repoData)
    const results = await Promise.all(
      fetchedPrs.map((fetched) =>
        stored.commentFetcher(fetched.number, repoData, fetched.authorName)
      )
    )

    return { stats: stored.stats, results }
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches reviews from the api on a cold database', async () => {
    const commentFetcher = vi.fn(async () => comments)

    const { stats, results } = await run(createTestDb(), [pr], commentFetcher)

    expect(commentFetcher).toHaveBeenCalledTimes(1)
    expect(commentFetcher).toHaveBeenCalledWith(pr.number, repoData, pr.authorName)
    expect(results).toEqual([comments])
    expect(stats).toEqual({
      prsPersisted: 1,
      commentsServedFromDb: 0,
      commentsFetchedFromApi: 1,
    })
  })

  it('serves reviews from the database on a second run without calling the api', async () => {
    const db = createTestDb()
    await run(
      db,
      [pr],
      vi.fn(async () => comments)
    )

    const secondFetcher = vi.fn(async () => comments)
    const { stats, results } = await run(db, [pr], secondFetcher)

    expect(secondFetcher).not.toHaveBeenCalled()
    expect(results).toEqual([comments])
    expect(stats.commentsServedFromDb).toBe(1)
    expect(stats.commentsFetchedFromApi).toBe(0)
  })

  it('refetches reviews when the PR has been updated', async () => {
    const db = createTestDb()
    await run(
      db,
      [pr],
      vi.fn(async () => comments)
    )

    const updatedComments: Comment[] = [{ id: 202, author: 'alice', body: 'Revised overview' }]
    const secondFetcher = vi.fn(async () => updatedComments)
    const { stats, results } = await run(
      db,
      [{ ...pr, lastUpdated: '2026-03-09T12:00:00Z' }],
      secondFetcher
    )

    expect(secondFetcher).toHaveBeenCalledTimes(1)
    expect(results).toEqual([updatedComments])
    expect(stats.commentsFetchedFromApi).toBe(1)
  })

  it('replaces stored reviews on refetch rather than accumulating them', async () => {
    const db = createTestDb()
    await run(
      db,
      [pr],
      vi.fn(async () => comments)
    )

    const updatedComments: Comment[] = [{ id: 202, author: 'alice', body: 'Revised overview' }]
    await run(db, [{ ...pr, lastUpdated: '2026-03-09T12:00:00Z' }], async () => updatedComments)

    // Third run is a hit, so it reveals exactly what is stored.
    const { results } = await run(
      db,
      [{ ...pr, lastUpdated: '2026-03-09T12:00:00Z' }],
      vi.fn(async () => [])
    )

    expect(results).toEqual([updatedComments])
  })

  it('keeps PRs with no reviews cached instead of refetching them', async () => {
    const db = createTestDb()
    await run(
      db,
      [pr],
      vi.fn(async () => [])
    )

    const secondFetcher = vi.fn(async () => [])
    const { stats, results } = await run(db, [pr], secondFetcher)

    expect(secondFetcher).not.toHaveBeenCalled()
    expect(results).toEqual([[]])
    expect(stats.commentsServedFromDb).toBe(1)
  })

  it('only refetches the PRs that changed', async () => {
    const db = createTestDb()
    const unchanged = pr
    const changing: PR = { ...pr, number: 2, title: 'Second PR' }

    // Review ids are unique per PR in GitHub's model.
    const reviewsFor: CommentFetcher = async (prNumber) => [
      { id: prNumber * 100, author: 'alice', body: `Overview for ${prNumber}` },
    ]

    await run(db, [unchanged, changing], vi.fn(reviewsFor))

    const secondFetcher = vi.fn(reviewsFor)
    const { stats } = await run(
      db,
      [unchanged, { ...changing, lastUpdated: '2026-03-09T12:00:00Z' }],
      secondFetcher
    )

    expect(secondFetcher).toHaveBeenCalledTimes(1)
    expect(secondFetcher).toHaveBeenCalledWith(changing.number, repoData, changing.authorName)
    expect(stats.commentsServedFromDb).toBe(1)
    expect(stats.commentsFetchedFromApi).toBe(1)
  })

  it('returns reviews unpersisted when the PR was never listed', async () => {
    const commentFetcher = vi.fn(async () => comments)
    const stored = createStoredFetchers(createTestDb(), async () => [], commentFetcher)

    const result = await stored.commentFetcher(pr.number, repoData, pr.authorName)

    expect(commentFetcher).toHaveBeenCalledTimes(1)
    expect(result).toEqual(comments)
  })

  it('keeps repos isolated from each other', async () => {
    const db = createTestDb()
    const otherRepo: RepoData = { owner: 'YorkMerrick', repo: 'otherRepo' }

    await run(
      db,
      [pr],
      vi.fn(async () => comments)
    )

    // Same PR number *and* review id under a different repo. Review ids are
    // globally unique in practice, so this is deliberately adversarial: it must
    // register as a miss and must not collide with the already-stored review.
    const otherFetcher = vi.fn(async () => comments)
    const stored = createStoredFetchers(db, async () => [pr], otherFetcher)
    await stored.prFetcher(otherRepo)
    await stored.commentFetcher(pr.number, otherRepo, pr.authorName)

    expect(otherFetcher).toHaveBeenCalledTimes(1)
  })

  it('drives PipelineService without changing its output', async () => {
    const db = createTestDb()
    const commentFetcher = vi.fn(async () => comments)
    const stored = createStoredFetchers(db, async () => [pr], commentFetcher)

    const promptData = await new PipelineService(
      stored.prFetcher,
      stored.commentFetcher
    ).buildAiPromptForRepos([repoData])

    expect(promptData).toEqual([
      {
        repoName: repoData.repo,
        prsData: [
          {
            prName: pr.title,
            author: { authorName: pr.authorName, authorEmail: pr.authorEmail },
            overview: comments[0],
          },
        ],
      },
    ])
    expect(commentFetcher).toHaveBeenCalledTimes(1)
  })
})
