import './config'
import { fetchPrs, fetchPrComments } from './api/github'
import type { RepoData } from './types/repoData'

function main() {
  const repoData: RepoData = {
    owner: 'YorkMerrick',
    repo: 'labweekSpring2026',
  }
  fetchPrs(repoData).then((prs) => console.log(prs))
  fetchPrComments(11, repoData).then((comments) => console.log(comments))
}

main()
