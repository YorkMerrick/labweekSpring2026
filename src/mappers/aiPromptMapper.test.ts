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

    // Only the first comment is kept as the overview, and 'Fix bug' has no
    // comments at all so it is dropped entirely.
    const expected: AiPromptRepoData = {
      repoName: 'repo1',
      prsData: [
        {
          prName: 'Add feature',
          author: { authorName: 'Alice', authorEmail: 'alice@example.com' },
          overview: { id: 101, author: 'Reviewer1', body: 'Looks good' },
        },
      ],
    }

    const result = aiPromptMapper(repo, prsWithComments)

    expect(result).toEqual(expected)
  })

  it('drops PRs authored by blacklisted bots', () => {
    const repo: RepoData = { owner: 'owner1', repo: 'repo1' }

    const prsWithComments: PRWithComments[] = [
      {
        pr: {
          title: 'Automated bump',
          number: 1,
          authorName: 'SVC-GDP-BOT',
          authorEmail: null,
        } as PR,
        comments: [{ id: 101, author: 'Reviewer1', body: 'Looks good' }],
      },
    ]

    const result = aiPromptMapper(repo, prsWithComments)

    expect(result.prsData).toEqual([])
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
