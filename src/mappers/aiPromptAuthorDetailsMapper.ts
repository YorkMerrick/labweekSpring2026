import type { AiPromptAuthorDetails } from '../types/aiPromptData'
import type { PR } from '../types/repo'

function aiPromptAuthorDetailsMapper(pr: PR): AiPromptAuthorDetails {
  return {
    authorName: pr.authorName,
    authorEmail: pr.authorEmail,
  }
}

export { aiPromptAuthorDetailsMapper }
