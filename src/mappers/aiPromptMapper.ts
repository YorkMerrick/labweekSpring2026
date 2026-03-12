import type { AiPromptRepoData } from '../types/aiPromptData.js'
import type { PRWithComments, RepoData } from '../types/repo.js'
import { aiPromptAuthorDetailsMapper } from './aiPromptAuthorDetailsMapper.js'

const blacklistAuthors = ['SVC-GDP-BOT']

function aiPromptMapper(repo: RepoData, prsWithComments: PRWithComments[]): AiPromptRepoData {
  const promptData: AiPromptRepoData = {
    repoName: repo.repo,
    prsData: prsWithComments
      .map(({ pr, comments }) => ({
        prName: pr.title,
        author: aiPromptAuthorDetailsMapper(pr),
        overview: comments[0] ?? null,
      }))
      .filter((pr) => !blacklistAuthors.includes(pr.author.authorName ?? '')),
  }
  return promptData
}

export { aiPromptMapper }
