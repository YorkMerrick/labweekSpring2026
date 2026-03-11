import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { RepoData, PR, Comment } from '../types/repo'
import type { AiPromptData } from '../types/aiPromptData'
import { PipelineService } from './pipelineService'

describe('PipelineService', () => {
  let mockPrFetcher: (repo: RepoData) => Promise<PR[]>
  let mockCommentFetcher: (prNumber: number, repo: RepoData) => Promise<Comment[]>
  let service: PipelineService

  const repoList: RepoData[] = [
    { owner: 'owner1', repo: 'repo1' },
    { owner: 'owner2', repo: 'repo2' },
  ]

  beforeEach(() => {
    mockPrFetcher = vi.fn(async (repo: RepoData) => {
      if (repo.repo === 'repo1') {
        return [
          { title: 'PR1', number: 1, authorName: 'Alice', authorEmail: 'alice@example.com' },
        ] as PR[]
      }
      return [
        { title: 'PR2', number: 2, authorName: 'Bob', authorEmail: 'bob@example.com' },
        { title: 'PR3', number: 3, authorName: 'Charlie', authorEmail: 'charlie@example.com' },
      ] as PR[]
    })

    mockCommentFetcher = vi.fn(async (prNumber: number) => {
      if (prNumber === 1) {
        return [{ id: 101, author: 'Reviewer1', body: 'Looks good' }] as Comment[]
      }
      return [
        { id: prNumber * 10 + 1, author: 'Reviewer2', body: 'Needs work' },
        { id: prNumber * 10 + 2, author: 'Reviewer3', body: 'Approved' },
      ] as Comment[]
    })

    service = new PipelineService(mockPrFetcher, mockCommentFetcher)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('builds AI prompt for multiple repos correctly', async () => {
    const result: AiPromptData = await service.buildAiPromptForRepos(repoList)

    expect(result).toHaveLength(2)

    // Repo 1
    expect(result[0]!.repoName).toBe('repo1')
    expect(result[0]!.prsData).toEqual([
      {
        prName: 'PR1',
        author: { authorName: 'Alice', authorEmail: 'alice@example.com' },
        comments: [{ id: 101, author: 'Reviewer1', body: 'Looks good' }],
      },
    ])

    // Repo 2
    expect(result[1]!.repoName).toBe('repo2')
    expect(result[1]!.prsData).toEqual([
      {
        prName: 'PR2',
        author: { authorName: 'Bob', authorEmail: 'bob@example.com' },
        comments: [
          { id: 21, author: 'Reviewer2', body: 'Needs work' },
          { id: 22, author: 'Reviewer3', body: 'Approved' },
        ],
      },
      {
        prName: 'PR3',
        author: { authorName: 'Charlie', authorEmail: 'charlie@example.com' },
        comments: [
          { id: 31, author: 'Reviewer2', body: 'Needs work' },
          { id: 32, author: 'Reviewer3', body: 'Approved' },
        ],
      },
    ])
  })

  it('calls fetchers the correct number of times', async () => {
    await service.buildAiPromptForRepos(repoList)

    expect(mockPrFetcher).toHaveBeenCalledTimes(2)
    expect(mockPrFetcher).toHaveBeenCalledWith(repoList[0])
    expect(mockPrFetcher).toHaveBeenCalledWith(repoList[1])

    expect(mockCommentFetcher).toHaveBeenCalledTimes(3)
    expect(mockCommentFetcher).toHaveBeenCalledWith(1, repoList[0])
    expect(mockCommentFetcher).toHaveBeenCalledWith(2, repoList[1])
    expect(mockCommentFetcher).toHaveBeenCalledWith(3, repoList[1])
  })
})
