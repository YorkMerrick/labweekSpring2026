import './config'
import { filteredPrs, fetchPrComments } from './api/github'
import { PipelineService } from './service/pipelineService'
import type { RepoData } from './types/repoData'

function main() {
  const repoData: RepoData = {
    owner: 'sky-uk',
    repo: 'sky-sport-group-android',
  }
  
  new PipelineService(filteredPrs, fetchPrComments).getComments(repoData).then((comments) => console.log(comments))
}
main()
