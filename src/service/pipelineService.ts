import { aiPromptMapper } from '../mappers/aiPromptMapper.js'
import type { AiPromptData } from '../types/aiPromptData.js'
import type { Comment, PR, RepoData } from '../types/repo.js'

type PrFetcher = (repoData: RepoData) => Promise<PR[]>
type CommentFetcher = (
  prNumber: number,
  repoData: RepoData,
  prAuthor: string | null
) => Promise<Comment[]>

class PipelineService {
  prFetcher: PrFetcher
  commentFetcher: CommentFetcher

  constructor(prFetcher: PrFetcher, commentFetcher: CommentFetcher) {
    this.prFetcher = prFetcher
    this.commentFetcher = commentFetcher
  }

  async buildAiPromptForRepos(repos: RepoData[]): Promise<AiPromptData> {
    return Promise.all(
      repos.map(async (repo) => {
        const prs = await this.prFetcher(repo)
        const prsWithComments = await Promise.all(
          prs.map(async (pr) => ({
            pr: pr,
            comments: await this.commentFetcher(pr.number, repo, pr.authorName),
          }))
        )

        return aiPromptMapper(repo, prsWithComments)
      })
    )
  }
}

export { PipelineService, type PrFetcher, type CommentFetcher }
