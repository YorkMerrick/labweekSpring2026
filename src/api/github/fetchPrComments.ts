import { octokit } from '../../client/octokit.js'
import type { Comment } from '../../types/comments.js'
import type { RepoData } from '../../types/repoData.js'

async function fetchPrComments(
  prNumber: number,
  repoData: RepoData,
  prAuthor: string
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
    author: prAuthor,
  }))

  return comments
}

export { fetchPrComments }
