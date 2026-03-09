import { octokit } from '../../client/octokit'
import type { Comment } from '../../types/comments'
import type { RepoData } from '../../types/repoData'

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

export { fetchPrComments }
