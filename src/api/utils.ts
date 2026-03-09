import { FilterTimeEnum } from "../enums/filterTimeEnum"
import type { TimePeriod } from "../types/timePeriod"

function getTimeGranularity(interval: FilterTimeEnum, filterTimePeriod?: TimePeriod): TimePeriod {
  if (filterTimePeriod) {
    return filterTimePeriod
  }

  const milisecondInADay = 24 * 60 * 60 * 1000

  const now = new Date()
  let from: Date

  switch (interval) {
    case FilterTimeEnum.DAY:
      from = new Date(now.getTime() - milisecondInADay)
      break
    case FilterTimeEnum.WEEK:
      from = new Date(now.getTime() - 7 * milisecondInADay)
      break
    case FilterTimeEnum.MONTH:
      from = new Date(now.getTime() - 30 * milisecondInADay)
      break
    default:
      from = new Date(now.getTime() - 7 * milisecondInADay)
      break
  }

  return {
    from: from.toISOString(),
    to: now.toISOString(),
  }
}

export { getTimeGranularity }