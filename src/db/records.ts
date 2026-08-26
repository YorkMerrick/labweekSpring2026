import type { Comment, PR } from '../types/repo.js'

type StoredRepo = {
  owner: string
  repo: string
  lastSyncedAt: string
}

// Reviews live inside the PR record rather than in their own collection. A
// key-value store cannot join, so embedding them means a cache check is a
// single read, and replacing them is one atomic write that keeps array order.
type StoredPr = PR & {
  // The pr.lastUpdated value that reviews were last fetched for. Null means
  // never fetched. This is the freshness signal rather than the length of
  // `reviews`, so PRs with zero Copilot reviews stay cached.
  reviewsSyncedForLastUpdated: string | null
  reviewsSyncedAt: string | null
  reviews: Comment[]
}

export type { StoredPr, StoredRepo }
