import { FilterTimeEnum } from '../../enums/filterTimeEnum.js'
import type { FilterTimePeriod } from '../../types/filterTimePeriod.js'

const MILLISECONDS_IN_A_DAY: number = 24 * 60 * 60 * 1000

const DAYS: Record<FilterTimeEnum, number> = {
  [FilterTimeEnum.DAY]: 1,
  [FilterTimeEnum.WEEK]: 7,
  [FilterTimeEnum.MONTH]: 30,
}

function createTimePeriod(from: Date, to: Date): FilterTimePeriod {
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  }
}

function getTimePeriodFromInterval(interval: FilterTimeEnum): FilterTimePeriod {
  const days = DAYS[interval] ?? 7

  const now = new Date()
  const from = new Date(now.getTime() - days * MILLISECONDS_IN_A_DAY)

  return createTimePeriod(from, now)
}

export { getTimePeriodFromInterval, createTimePeriod }
