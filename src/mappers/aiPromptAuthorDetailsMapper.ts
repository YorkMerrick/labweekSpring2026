import type { AiPromptAuthorDetails } from '../types/aiPromptData.js'
import type { PR } from '../types/repo.js'

function aiPromptAuthorDetailsMapper(pr: PR): AiPromptAuthorDetails {
  return {
    authorName: pr.authorName,
    authorEmail: pr.authorEmail,
  }
}

export { aiPromptAuthorDetailsMapper }
