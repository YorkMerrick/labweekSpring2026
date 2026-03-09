// Ensure './config' is the first import
import './config'
import { fetchPrComments } from './api/github/fetchPrComments'
import { fetchFilteredPrs } from './api/github/fetchFilteredPrs'
import { PipelineService } from './service/pipelineService'
import type { RepoData } from './types/repoData'

function main() {
  const repoData: RepoData = {
    owner: 'sky-uk',
    repo: 'sky-sport-group-android',
  }

  new PipelineService(fetchFilteredPrs, fetchPrComments)
    .getComments(repoData)
    .then((comments) => console.log(comments))
}

main()
