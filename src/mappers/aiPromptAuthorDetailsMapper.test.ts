import { describe, it, expect } from 'vitest'
import type { PR } from '../types/repo'
import type { AiPromptAuthorDetails } from '../types/aiPromptData'
import { aiPromptAuthorDetailsMapper } from './aiPromptAuthorDetailsMapper'

describe('aiPromptAuthorDetailsMapper', () => {
  it('maps PR author details correctly', () => {
    const pr: PR = {
      title: 'Add new feature',
      number: 42,
      authorName: 'Jane Doe',
      authorEmail: 'jane@example.com',
      url: '',
      createdAt: '',
      lastUpdated: '',
    }

    const expected: AiPromptAuthorDetails = {
      authorName: 'Jane Doe',
      authorEmail: 'jane@example.com',
    }

    const result = aiPromptAuthorDetailsMapper(pr)

    expect(result).toEqual(expected)
  })
})
