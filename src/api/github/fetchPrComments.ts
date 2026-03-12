import type { Comment, RepoData } from '../../types/repo.js'
import { octokit } from '../clients/octokit.js'

async function fetchPrComments(
  prNumber: number,
  repoData: RepoData,
  prAuthor: string | null
): Promise<Comment[]> {
  const rawComments = await octokit.rest.pulls.listReviews({
    owner: repoData.owner,
    repo: repoData.repo,
    pull_number: prNumber,
  })

  const filteredComments = rawComments.data.filter((comment) =>
    comment.user?.login?.includes('copilot')
  )

  const comments: Comment[] = filteredComments.map((comment) => ({
    id: comment.id,
    body: comment.body ?? '',
    author: prAuthor ?? 'unknown',
  }))

  return comments
}

export { fetchPrComments }
