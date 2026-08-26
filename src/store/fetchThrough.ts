import type { Db } from '../db/client.js'
import type { CommentFetcher, PrFetcher } from '../service/pipelineService.js'
import { createCommentStore } from './commentStore.js'
import { createPrStore } from './prStore.js'
import { createRepoStore } from './repoStore.js'

type StoredFetcherStats = {
  prsPersisted: number
  commentsServedFromDb: number
  commentsFetchedFromApi: number
}

/**
 * Wraps the pipeline's fetchers so GitHub data is persisted on the way through
 * and re-served from SQLite on later runs.
 *
 * PRs are always listed from the API (one cheap call per repo) because that
 * response carries the `lastUpdated` needed to judge freshness. Reviews, which
 * are one call *per PR*, are only fetched when a PR is new or has changed.
 */
function createStoredFetchers(db: Db, prFetcher: PrFetcher, commentFetcher: CommentFetcher) {
  const repoStore = createRepoStore(db)
  const prStore = createPrStore(db)
  const commentStore = createCommentStore(db)

  const stats: StoredFetcherStats = {
    prsPersisted: 0,
    commentsServedFromDb: 0,
    commentsFetchedFromApi: 0,
  }

  const storedPrFetcher: PrFetcher = async (repoData) => {
    const prs = await prFetcher(repoData)

    const repoId = repoStore.upsertRepo(repoData, new Date().toISOString())
    prStore.upsertPrs(repoId, prs)
    stats.prsPersisted += prs.length

    return prs
  }

  const storedCommentFetcher: CommentFetcher = async (prNumber, repoData, prAuthor) => {
    const repoId = repoStore.findRepoId(repoData)
    const storedPr = repoId === undefined ? undefined : prStore.findPr(repoId, prNumber)

    // A PR whose reviews were fetched at its current revision is a hit, even if
    // it has zero reviews. Most PRs have no Copilot review, so treating "no
    // rows" as a miss would refetch the majority of them on every run.
    if (storedPr && storedPr.reviewsSyncedForLastUpdated === storedPr.lastUpdated) {
      stats.commentsServedFromDb += 1
      return commentStore.findCommentsForPr(storedPr.id)
    }

    const comments = await commentFetcher(prNumber, repoData, prAuthor)
    stats.commentsFetchedFromApi += 1

    // Without a stored PR row there is nothing to anchor the reviews to, so the
    // fetched result is returned unpersisted rather than dropped.
    if (storedPr) {
      commentStore.replaceCommentsForPr(storedPr.id, comments)
      prStore.markReviewsSynced(storedPr.id, storedPr.lastUpdated, new Date().toISOString())
    }

    return comments
  }

  return { prFetcher: storedPrFetcher, commentFetcher: storedCommentFetcher, stats }
}

export { createStoredFetchers, type StoredFetcherStats }
