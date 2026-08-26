import { and, eq } from 'drizzle-orm'
import type { Db } from '../db/client.js'
import { repos } from '../db/schema.js'
import type { RepoData } from '../types/repo.js'

function createRepoStore(db: Db) {
  // Inserts the repo if unseen, otherwise refreshes its sync timestamp. Either
  // way the row id is returned so PRs can be attached to it.
  function upsertRepo(repoData: RepoData, syncedAt: string): number {
    const row = db
      .insert(repos)
      .values({ owner: repoData.owner, repo: repoData.repo, lastSyncedAt: syncedAt })
      .onConflictDoUpdate({
        target: [repos.owner, repos.repo],
        set: { lastSyncedAt: syncedAt },
      })
      .returning({ id: repos.id })
      .get()

    if (!row) {
      throw new Error(`Failed to upsert repo ${repoData.owner}/${repoData.repo}`)
    }

    return row.id
  }

  function findRepoId(repoData: RepoData): number | undefined {
    return db
      .select({ id: repos.id })
      .from(repos)
      .where(and(eq(repos.owner, repoData.owner), eq(repos.repo, repoData.repo)))
      .get()?.id
  }

  return { upsertRepo, findRepoId }
}

type RepoStore = ReturnType<typeof createRepoStore>

export { createRepoStore, type RepoStore }
