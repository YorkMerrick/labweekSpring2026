import { and, eq } from 'drizzle-orm'
import type { Db } from '../db/client.js'
import { prs } from '../db/schema.js'
import type { PR } from '../types/repo.js'

type StoredPr = typeof prs.$inferSelect

function createPrStore(db: Db) {
  function upsertPrs(repoId: number, prList: PR[]): void {
    if (prList.length === 0) {
      return
    }

    db.transaction((tx) => {
      for (const pr of prList) {
        const values = {
          title: pr.title,
          authorName: pr.authorName,
          authorEmail: pr.authorEmail,
          url: pr.url,
          createdAt: pr.createdAt,
          lastUpdated: pr.lastUpdated,
        }

        tx.insert(prs)
          .values({ repoId, number: pr.number, ...values })
          .onConflictDoUpdate({
            target: [prs.repoId, prs.number],
            // `reviewsSyncedForLastUpdated` is deliberately left untouched here.
            // Clobbering it would discard the record of which PR revision the
            // stored reviews belong to, forcing a refetch on every run.
            set: values,
          })
          .run()
      }
    })
  }

  function findPr(repoId: number, number: number): StoredPr | undefined {
    return db
      .select()
      .from(prs)
      .where(and(eq(prs.repoId, repoId), eq(prs.number, number)))
      .get()
  }

  function markReviewsSynced(prId: number, lastUpdated: string, syncedAt: string): void {
    db.update(prs)
      .set({ reviewsSyncedForLastUpdated: lastUpdated, reviewsSyncedAt: syncedAt })
      .where(eq(prs.id, prId))
      .run()
  }

  return { upsertPrs, findPr, markReviewsSynced }
}

type PrStore = ReturnType<typeof createPrStore>

export { createPrStore, type PrStore, type StoredPr }
