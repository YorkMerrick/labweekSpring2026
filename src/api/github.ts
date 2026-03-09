import type { PR } from '../types/pr'
import { octokit } from './octokit'
import type{ RepoData } from '../types/repoData'
import type { Comment } from '../types/comments'

async function fetchPrs(repoData: RepoData): Promise<PR[]> {
  const rawPrs = await octokit.paginate(octokit.rest.pulls.list, {
    owner: repoData.owner,
    repo: repoData.repo,
    state: 'closed',
    per_page: 30,
  })

  const simplePrs: PR[] = rawPrs.map((pr) => ({
    number: pr.number,
    title: pr.title,
    author: pr.user?.login ?? 'unknown',
    url: pr.html_url,
    created_at: pr.created_at,
  }))

  return simplePrs
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

  return comments
}

export { fetchPrs, fetchPrComments }
