import { describe, it, expect } from 'vitest'
import type { PR, RepoData, PRWithComments } from '../types/repo'
import type { AiPromptRepoData } from '../types/aiPromptData'
import { aiPromptMapper } from './aiPromptMapper'

describe('aiPromptMapper', () => {
  it('maps PRs with comments to AiPromptRepoData correctly', () => {
    const repo: RepoData = {
      owner: 'owner1',
      repo: 'repo1',
    }

    const prsWithComments: PRWithComments[] = [
      {
        pr: {
          title: 'Add feature',
          number: 1,
          authorName: 'Alice',
          authorEmail: 'alice@example.com',
        } as PR,
        comments: [
          { id: 101, author: 'Reviewer1', body: 'Looks good' },
          { id: 102, author: 'Reviewer2', body: 'Please fix typo' },
        ],
      },
      {
        pr: {
          title: 'Fix bug',
          number: 2,
          authorName: 'Bob',
          authorEmail: 'bob@example.com',
        } as PR,
        comments: [],
      },
    ]

    const expected: AiPromptRepoData = {
      repoName: 'repo1',
      prsData: [
        {
          prName: 'Add feature',
          author: { authorName: 'Alice', authorEmail: 'alice@example.com' },
          comments: [
            { id: 101, author: 'Reviewer1', body: 'Looks good' },
            { id: 102, author: 'Reviewer2', body: 'Please fix typo' },
          ],
        },
        {
          prName: 'Fix bug',
          author: { authorName: 'Bob', authorEmail: 'bob@example.com' },
          comments: [],
        },
      ],
    }

    const result = aiPromptMapper(repo, prsWithComments)

    expect(result).toEqual(expected)
  })

  it('handles empty PR list', () => {
    const repo: RepoData = { owner: 'owner1', repo: 'repo1' }
    const prsWithComments: PRWithComments[] = []

    const expected: AiPromptRepoData = {
      repoName: 'repo1',
      prsData: [],
    }

    const result = aiPromptMapper(repo, prsWithComments)

    expect(result).toEqual(expected)
  })
})
