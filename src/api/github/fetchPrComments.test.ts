import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchPrComments } from './fetchPrComments'
import { octokit } from '../clients/octokit'
import type { Comment, RepoData } from '../../types/repo'

describe('fetchPrComments', () => {
  const repoData: RepoData = { owner: 'YorkMerrick', repo: 'labweekSpring2026' }
  const prNumber = 123

  const fakeReviews = [
    {
      id: 1,
      user: { login: 'copilot-bot' },
      body: 'Looks good to me',
    },
    {
      id: 2,
      user: { login: 'alice' },
      body: 'Please fix this',
    },
    {
      id: 3,
      user: null,
      body: 'auto comment',
    },
    {
      id: 4,
      user: { login: 'copilot-bot' },
      body: null,
    },
  ]

  let listReviewsSpy: any

  beforeEach(() => {
    listReviewsSpy = vi
      .spyOn(octokit.rest.pulls, 'listReviews')
      .mockResolvedValue({ data: fakeReviews } as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls octokit.rest.pulls.listReviews with correct parameters', async () => {
    await fetchPrComments(prNumber, repoData, 'copilot-bot')

    expect(listReviewsSpy).toHaveBeenCalledWith({
      owner: repoData.owner,
      repo: repoData.repo,
      pull_number: prNumber,
    })
  })

  it('maps comments correctly and filters for copilot authors', async () => {
    const result: Comment[] = await fetchPrComments(prNumber, repoData, 'copilot-bot')

    const expected: Comment[] = [
      {
        id: 1,
        author: 'copilot-bot',
        body: 'Looks good to me',
      },
      {
        id: 4,
        author: 'copilot-bot',
        body: '', // fallback for null body
      },
    ]

    expect(result).toEqual(expected)
  })

  it('returns empty array if no copilot comments', async () => {
    listReviewsSpy.mockResolvedValueOnce({
      data: [{ id: 5, user: { login: 'alice' }, body: 'ok' }],
    } as any)

    const result = await fetchPrComments(prNumber, repoData, 'copilot-bot')
    expect(result).toEqual([])
  })
})
