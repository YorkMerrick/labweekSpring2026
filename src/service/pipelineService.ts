import type { PR } from '../types/pr'
import type { RepoData } from '../types/repoData'
import type { Comment } from '../types/comments'

type PrFetcher = (repoData: RepoData) => Promise<PR[]>
type CommentFetcher = (prNumber: number, repoData: RepoData) => Promise<Comment[]>

class PipelineService {
  prFetcher: PrFetcher
  commentFetcher: CommentFetcher

  constructor(prFetcher: PrFetcher, commentFetcher: CommentFetcher) {
    this.prFetcher = prFetcher
    this.commentFetcher = commentFetcher
  }

  async getComments(repoData: RepoData) {
    const listOfPrs: PR[] = await this.prFetcher(repoData)
    const listOfComments: Comment[] = []

    for (const pr of listOfPrs) {
      const comments = await this.commentFetcher(pr.number, repoData)
      listOfComments.push(...comments)
    }

    return listOfComments
  }
}

export { PipelineService }
