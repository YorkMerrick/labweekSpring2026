import type { AiPromptRepoData } from '../types/aiPromptData'
import type { PRWithComments, RepoData } from '../types/repo'
import { aiPromptAuthorDetailsMapper } from './aiPromptAuthorDetailsMapper'

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
