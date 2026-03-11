import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import { loadRepos } from './loadRepos'
import type { RepoData } from '../types/repo'

describe('loadRepos', () => {
  const mockFilePath = 'mockInput.json'
  const mockRepos: RepoData[] = [
    { owner: 'owner1', repo: 'repo1' },
    { owner: 'owner2', repo: 'repo2' },
  ]

  beforeEach(() => {
    vi.spyOn(fs, 'readFileSync').mockImplementation((path: fs.PathOrFileDescriptor) => {
      expect(path).toBe(mockFilePath)
      return JSON.stringify(mockRepos)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads repo data correctly from JSON file', () => {
    const repos = loadRepos(mockFilePath)
    expect(repos).toEqual(mockRepos)
  })

  it('uses default file path if none is provided', () => {
    const defaultFilePath = 'input.json'

    const spy = vi.spyOn(fs, 'readFileSync').mockImplementation((path: fs.PathOrFileDescriptor) => {
      expect(path).toBe(defaultFilePath)
      return JSON.stringify(mockRepos)
    })

    const repos = loadRepos()
    expect(repos).toEqual(mockRepos)

    spy.mockRestore()
  })

  it('throws error if JSON is invalid', () => {
    vi.spyOn(fs, 'readFileSync').mockReturnValue('INVALID JSON')

    expect(() => loadRepos(mockFilePath)).toThrow()
  })
})
