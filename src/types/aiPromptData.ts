import type { Comment } from './repo'

export type AiPromptData = AiPromptRepoData[]

export type AiPromptRepoData = {
  repoName: string
  prsData: AiPromptPrData[]
}

export type AiPromptPrData = {
  prName: string
  author: AiPromptAuthorDetails
  overview: Comment | null
}

export type AiPromptAuthorDetails = {
  authorName: string | null
  authorEmail: string | null
}
