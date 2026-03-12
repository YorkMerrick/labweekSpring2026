import type { AiPromptRepoData } from '../types/aiPromptData.js'
import type { PRWithComments, RepoData } from '../types/repo.js'
import { aiPromptAuthorDetailsMapper } from './aiPromptAuthorDetailsMapper.js'

function aiPromptMapper(repo: RepoData, prsWithComments: PRWithComments[]): AiPromptRepoData {
  return {
    repoName: repo.repo,
    prsData: prsWithComments.map(({ pr, comments }) => ({
      prName: pr.title,
      author: aiPromptAuthorDetailsMapper(pr),
      comments,
    })),
  }
}

export { aiPromptMapper }
