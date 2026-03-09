import type { PR } from '../types/pr'
import { octokit } from './octokit'
import type{ RepoData } from '../types/repoData'
import type { Comment } from '../types/comments'
import type { TimePeriod } from '../types/timePeriod'
import { FilterTimeEnum } from '../enums/filterTimeEnum'
import { getTimeGranularity } from './utils'

async function fetchPrs(repoData: RepoData): Promise<PR[]> {
  const rawPrs = await octokit.rest.pulls.list({
    owner: repoData.owner,
    repo: repoData.repo,
    state: 'closed',
    per_page: 100,
  }).then((response) => response.data).catch((error) => {
    console.error('Error fetching PRs:', error)
    return []
  })

  const simplePrs: PR[] = rawPrs.map((pr) => ({
    number: pr.number,
    title: pr.title,
    author: pr.user?.login ?? 'unknown',
    url: pr.html_url,
    created_at: pr.created_at,
    last_updated: pr.updated_at,
  }))

  return simplePrs
}

async function filteredPrs(
  repoData: RepoData,
  interval: FilterTimeEnum = FilterTimeEnum.WEEK,
  filterTimePeriod?: TimePeriod,
) {

  const timeGranularity = getTimeGranularity(interval, filterTimePeriod)
  console.log(timeGranularity)

  const pullRequests = await fetchPrs(repoData).then((prs) => {
    return prs
  })

  const filteredPrs = pullRequests.filter((pr) => {
    const prDate = new Date(pr.created_at)
    const fromDate = new Date(timeGranularity.from)
    const toDate = new Date(timeGranularity.to)
    return prDate >= fromDate && prDate <= toDate
  })
  return filteredPrs
}

async function fetchPrComments(prNumber: number, repoData: RepoData) {
  const rawComments = await octokit.rest.pulls.listReviews({
    owner: repoData.owner,
    repo: repoData.repo,
    pull_number: prNumber,
  })

  const comments: Comment[] = rawComments.data.map((comment) => ({
    id: comment.id,
    author: comment.user?.login ?? 'unknown',
    body: comment.body ?? '',
  }))

  return comments.filter((comment) => comment.author.includes('copilot'))
}

export { fetchPrs, fetchPrComments, filteredPrs }
