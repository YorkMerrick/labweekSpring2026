// Ensure './config' is the first import
import './config.js'
import { fetchPrComments } from './api/github/fetchPrComments.js'
import { fetchFilteredPrs } from './api/github/fetchFilteredPrs.js'
import { PipelineService } from './service/pipelineService.js'
import { promises } from 'fs'
import type { AiPromptData } from './types/aiPromptData.js'
import { loadRepos } from './loaders/loadRepos.js'
import { createDb } from './db/client.js'
import { createStoredFetchers } from './store/fetchThrough.js'

async function main() {
  const repos = loadRepos('input.json')

  const db = createDb()
  const stored = createStoredFetchers(db, fetchFilteredPrs, fetchPrComments)

  try {
    const promptData = await new PipelineService(
      stored.prFetcher,
      stored.commentFetcher
    ).buildAiPromptForRepos(repos)

    await writePromptDataToFile('promptData.json', promptData)

    console.log(
      `Reviews: ${stored.stats.commentsServedFromDb} from db, ` +
        `${stored.stats.commentsFetchedFromApi} from GitHub ` +
        `(${stored.stats.prsPersisted} PRs persisted)`
    )
  } catch (error) {
    console.error('Error creating prompt data:', error)
  } finally {
    // LevelDB locks its directory while open, so it has to be released even
    // when the run fails or the next run cannot start.
    await db.close()
  }
}

main()

async function writePromptDataToFile(filepath: string, promptData: AiPromptData) {
  return promises
    .writeFile(filepath, JSON.stringify(promptData, null, 2), {
      flag: 'w',
    })
    .then(() => {
      console.log('Finish Write')
    })
}
