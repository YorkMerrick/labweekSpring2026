import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getTimePeriodFromInterval, createTimePeriod } from './time'
import { FilterTimeEnum } from '../../enums/filterTimeEnum'

describe('createTimePeriod', () => {
  it('returns a FilterTimePeriod with ISO strings', () => {
    const from = new Date('2026-03-01T00:00:00Z')
    const to = new Date('2026-03-09T12:00:00Z')

    const period = createTimePeriod(from, to)

    expect(period.from).toBe('2026-03-01T00:00:00.000Z')
    expect(period.to).toBe('2026-03-09T12:00:00.000Z')
  })
})

describe('getTimeGranularity', () => {
  const fixedNow = new Date('2026-03-09T12:00:00Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns last day for FilterTimeEnum.DAY', () => {
    const period = getTimePeriodFromInterval(FilterTimeEnum.DAY)
    expect(period.to).toBe('2026-03-09T12:00:00.000Z')
    expect(period.from).toBe('2026-03-08T12:00:00.000Z')
  })

  it('returns last week for FilterTimeEnum.WEEK', () => {
    const period = getTimePeriodFromInterval(FilterTimeEnum.WEEK)
    expect(period.to).toBe('2026-03-09T12:00:00.000Z')
    expect(period.from).toBe('2026-03-02T12:00:00.000Z')
  })

  it('returns last month for FilterTimeEnum.MONTH', () => {
    const period = getTimePeriodFromInterval(FilterTimeEnum.MONTH)
    expect(period.to).toBe('2026-03-09T12:00:00.000Z')
    expect(period.from).toBe('2026-02-07T12:00:00.000Z')
  })

  it('defaults to last week for invalid interval', () => {
    // @ts-expect-error passing invalid enum to test default
    const period = getTimePeriodFromInterval('INVALID')
    expect(period.to).toBe('2026-03-09T12:00:00.000Z')
    expect(period.from).toBe('2026-03-02T12:00:00.000Z')
  })
})
