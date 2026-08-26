import { repoKey, type Db } from '../db/client.js'
import type { StoredRepo } from '../db/records.js'
import type { RepoData } from '../types/repo.js'

function createRepoStore(db: Db) {
  // There is no surrogate id to hand back: the owner and repo pair is the key,
  // so nothing downstream needs to look one up.
  async function markSynced(repoData: RepoData, syncedAt: string): Promise<void> {
    await db.repos.put(repoKey(repoData), {
      owner: repoData.owner,
      repo: repoData.repo,
      lastSyncedAt: syncedAt,
    })
  }

  async function findRepo(repoData: RepoData): Promise<StoredRepo | undefined> {
    return db.repos.get(repoKey(repoData))
  }

  return { markSynced, findRepo }
}

type RepoStore = ReturnType<typeof createRepoStore>

export { createRepoStore, type RepoStore }
