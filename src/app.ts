// Ensure './config' is the first import
import './config.js'
import { fetchPrComments } from './api/github/fetchPrComments.js'
import { fetchFilteredPrs } from './api/github/fetchFilteredPrs.js'
import { PipelineService } from './service/pipelineService.js'
import type { RepoData } from './types/repoData.js'
import type { Comment } from './types/comments.js'
import { promises } from 'fs'

function main() {
  const repoData: RepoData = {
    owner: 'sky-uk',
    repo: 'sky-sport-group-android',
  }

  new PipelineService(fetchFilteredPrs, fetchPrComments)
    .getComments(repoData)
    .then((fetchedComments) => writeCommentToFile('./comments.json', fetchedComments))
    .catch((error) => {
      console.error('Error fetching comments:', error)
    })
}

main()

async function writeCommentToFile(filepath: string, comments: Comment[]) {
  promises
    .writeFile('comments.json', JSON.stringify(comments, null, 2), {
      flag: 'w',
    })
    .then(() => {
      console.log('Finish Write')
    })
}
