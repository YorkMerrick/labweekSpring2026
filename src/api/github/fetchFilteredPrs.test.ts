import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { filterPrs, fetchFilteredPrs } from './fetchFilteredPrs'
import { fetchPrs } from './fetchPrs'
import type { PR } from '../../types/pr'
import type { RepoData } from '../../types/repoData'
import { FilterTimeEnum } from '../../enums/filterTimeEnum'
import * as timeUtils from '../utils/time'

vi.mock('./fetchPrs')

describe('filterPrs', () => {
  const now = new Date('2026-03-09T12:00:00Z')
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()

  const prs: PR[] = [
    {
      number: 1,
      title: 'A',
      author: 'alice',
      url: '',
      created_at: oneDayAgo,
      last_updated: oneDayAgo,
    },
    {
      number: 2,
      title: 'B',
      author: 'bob',
      url: '',
      created_at: twoDaysAgo,
      last_updated: twoDaysAgo,
    },
  ]

  it('filters PRs within the time period', () => {
    const filtered = filterPrs(prs, { from: twoDaysAgo, to: oneDayAgo })
    expect(filtered.length).toBe(2)
    expect(filtered.map((pr) => pr.number)).toEqual([1, 2])
  })

  it('excludes PRs outside the time period', () => {
    const filtered = filterPrs(prs, { from: oneDayAgo, to: now.toISOString() })
    expect(filtered.length).toBe(1)
    expect(filtered[0]!.number).toBe(1)
  })
})

describe('fetchFilteredPrs', () => {
  const repoData: RepoData = { owner: 'YorkMerrick', repo: 'labweekSpring2026' }

  const fakePrs: PR[] = [
    {
      number: 1,
      title: 'A',
      author: 'alice',
      url: '',
      created_at: '2026-03-01T12:00:00Z',
      last_updated: '2026-03-01T12:00:00Z',
    },
    {
      number: 2,
      title: 'B',
      author: 'bob',
      url: '',
      created_at: '2026-03-08T12:00:00Z',
      last_updated: '2026-03-08T12:00:00Z',
    },
  ]

  let timePeriodMock: any

  beforeEach(() => {
    ;(fetchPrs as any).mockResolvedValue(fakePrs)

    timePeriodMock = vi.spyOn(timeUtils, 'getTimePeriodFromInterval').mockReturnValue({
      from: '2026-03-07T00:00:00Z',
      to: '2026-03-09T00:00:00Z',
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('fetches PRs and filters by interval', async () => {
    const result = await fetchFilteredPrs(repoData, FilterTimeEnum.WEEK)

    expect(fetchPrs).toHaveBeenCalledWith(repoData)
    expect(timePeriodMock).toHaveBeenCalledWith(FilterTimeEnum.WEEK)

    expect(result.length).toBe(1)
    expect(result[0]!.number).toBe(2)
  })
})
