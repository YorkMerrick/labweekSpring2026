// Ensure './config' is the first import
import './config.js'
import { fetchPrComments } from './api/github/fetchPrComments.js'
import { fetchFilteredPrs } from './api/github/fetchFilteredPrs.js'
import { PipelineService } from './service/pipelineService.js'
import { promises } from 'fs'
import type { AiPromptData } from './types/aiPromptData.js'
import { loadRepos } from './loaders/loadRepos.js'

function main() {
  const repos = loadRepos('input.json')

  new PipelineService(fetchFilteredPrs, fetchPrComments)
    .buildAiPromptForRepos(repos)
    .then((promptData) => writePromptDataToFile('promptData.json', promptData))
    .catch((error) => {
      console.error('Error creating prompt data:', error)
    })
}

main()

async function writePromptDataToFile(filepath: string, promptData: AiPromptData) {
  promises
    .writeFile(filepath, JSON.stringify(promptData, null, 2), {
      flag: 'w',
    })
    .then(() => {
      console.log('Finish Write')
    })
}
