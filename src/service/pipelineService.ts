import type { PR } from '../types/pr.js'
import type { RepoData } from '../types/repoData.js'
import type { Comment } from '../types/comments.js'

type PrFetcher = (repoData: RepoData) => Promise<PR[]>
type CommentFetcher = (prNumber: number, repoData: RepoData, prAuthor: string) => Promise<Comment[]>

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
      const comments = await this.commentFetcher(pr.number, repoData, pr.author)
      listOfComments.push(...comments)
    }

    return listOfComments
  }
}

export { PipelineService }
