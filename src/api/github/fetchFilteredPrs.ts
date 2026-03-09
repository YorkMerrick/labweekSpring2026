import { FilterTimeEnum } from '../../enums/filterTimeEnum'
import type { PR } from '../../types/pr'
import type { RepoData } from '../../types/repoData'
import type { FilterTimePeriod } from '../../types/filterTimePeriod'
import { getTimePeriodFromInterval } from '../utils/time'
import { fetchPrs } from './fetchPrs'

function filterPrs(prs: PR[], timePeriod: FilterTimePeriod) {
  const fromDate = new Date(timePeriod.from)
  const toDate = new Date(timePeriod.to)

  return prs.filter((pr) => {
    const prDate = new Date(pr.created_at)
    return prDate >= fromDate && prDate <= toDate
  })
}

async function fetchFilteredPrs(
  repoData: RepoData,
  interval: FilterTimeEnum = FilterTimeEnum.WEEK
) {
  const timeGranularity = getTimePeriodFromInterval(interval)
  const pullRequests = await fetchPrs(repoData)

  return filterPrs(pullRequests, timeGranularity)
}

export { filterPrs, fetchFilteredPrs }
