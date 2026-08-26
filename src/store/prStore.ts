import { prKey, type Db } from '../db/client.js'
import type { StoredPr } from '../db/records.js'
import type { Comment, PR, RepoData } from '../types/repo.js'

function createPrStore(db: Db) {
  // A key-value store has no targeted update, so refreshing PR metadata is a
  // read-modify-write over the whole record. The review fields have to be
  // carried across explicitly: dropping them would discard which revision the
  // stored reviews belong to and force a refetch on every run.
  async function upsertPrs(repoData: RepoData, prList: PR[]): Promise<void> {
    if (prList.length === 0) {
      return
    }

    const keys = prList.map((pr) => prKey(repoData, pr.number))
    const existing = await db.prs.getMany(keys)

    await db.prs.batch(
      prList.map((pr, index) => {
        const stored = existing[index]

        return {
          type: 'put' as const,
          key: keys[index]!,
          value: {
            ...pr,
            reviewsSyncedForLastUpdated: stored?.reviewsSyncedForLastUpdated ?? null,
            reviewsSyncedAt: stored?.reviewsSyncedAt ?? null,
            reviews: stored?.reviews ?? [],
          },
        }
      })
    )
  }

  async function findPr(repoData: RepoData, prNumber: number): Promise<StoredPr | undefined> {
    return db.prs.get(prKey(repoData, prNumber))
  }

  // The reviews and the marker recording which revision they belong to are
  // written in the same record, so a hit can never pair reviews with a
  // different revision than the one they were fetched for.
  async function saveReviews(
    repoData: RepoData,
    storedPr: StoredPr,
    reviews: Comment[],
    syncedAt: string
  ): Promise<void> {
    await db.prs.put(prKey(repoData, storedPr.number), {
      ...storedPr,
      reviews,
      reviewsSyncedForLastUpdated: storedPr.lastUpdated,
      reviewsSyncedAt: syncedAt,
    })
  }

  return { upsertPrs, findPr, saveReviews }
}

type PrStore = ReturnType<typeof createPrStore>

export { createPrStore, type PrStore }
