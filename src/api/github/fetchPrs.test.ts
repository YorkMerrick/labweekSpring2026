import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchPrs } from './fetchPrs'
import { octokit } from '../clients/octokit'
import type { PR, RepoData } from '../../types/repo'

describe('fetchPrs', () => {
  const repoData: RepoData = { owner: 'YorkMerrick', repo: 'labweekSpring2026' }

  const fakePrs = [
    {
      number: 1,
      title: 'Add new feature',
      user: { login: 'alice', email: 'alice@email.com' },
      html_url: 'https://github.com/owner/repo/pull/1',
      created_at: '2026-03-01T12:00:00Z',
      updated_at: '2026-03-02T12:00:00Z',
    },
    {
      number: 2,
      title: 'Fix bug',
      user: null, // simulate missing user
      html_url: 'https://github.com/owner/repo/pull/2',
      created_at: '2026-03-03T12:00:00Z',
      updated_at: '2026-03-04T12:00:00Z',
    },
  ]

  let listSpy: any

  beforeEach(() => {
    listSpy = vi.spyOn(octokit.rest.pulls, 'list').mockResolvedValue({ data: fakePrs } as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls octokit.rest.pulls.list with correct parameters', async () => {
    await fetchPrs(repoData)

    expect(listSpy).toHaveBeenCalledWith({
      owner: repoData.owner,
      repo: repoData.repo,
      state: 'closed',
      per_page: 100,
    })
  })

  it('returns simplified PR objects', async () => {
    const result = await fetchPrs(repoData)

    const expected: PR[] = [
      {
        number: 1,
        title: 'Add new feature',
        authorName: 'alice',
        authorEmail: 'alice@email.com',
        url: 'https://github.com/owner/repo/pull/1',
        createdAt: '2026-03-01T12:00:00Z',
        lastUpdated: '2026-03-02T12:00:00Z',
      },
      {
        number: 2,
        title: 'Fix bug',
        authorName: 'unknown', // fallback for missing user
        authorEmail: 'unknown', // fallback for missing email
        url: 'https://github.com/owner/repo/pull/2',
        createdAt: '2026-03-03T12:00:00Z',
        lastUpdated: '2026-03-04T12:00:00Z',
      },
    ]

    expect(result).toEqual(expected)
  })

  it('returns empty array when octokit call fails', async () => {
    listSpy.mockRejectedValueOnce(new Error('GitHub error'))

    const result = await fetchPrs(repoData)
    expect(result).toEqual([])
  })
})
