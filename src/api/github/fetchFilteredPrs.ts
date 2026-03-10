import { FilterTimeEnum } from '../../enums/filterTimeEnum'
import type { PR } from '../../types/pr'
import type { RepoData } from '../../types/repoData'
import type { FilterTimePeriod } from '../../types/filterTimePeriod'
import { getTimePeriodFromInterval } from '../utils/time'
import { fetchPrs } from './fetchPrs'
import { writeFile } from 'fs/promises'

function filterPrs(prs: PR[], timePeriod: FilterTimePeriod) {
  const fromDate = new Date(timePeriod.from)
  const toDate = new Date(timePeriod.to)

  return prs.filter((pr) => {
    const prDate = new Date(pr.last_updated)
    return prDate >= fromDate && prDate <= toDate
  })
}

async function fetchFilteredPrs(
  repoData: RepoData,
  interval: FilterTimeEnum = FilterTimeEnum.WEEK
) {
  const timeGranularity = getTimePeriodFromInterval(interval)
  const pullRequests = await fetchPrs(repoData)

  await writeFile('./pullRequests.json', JSON.stringify(pullRequests, null, 2), { flag: 'w' })

  const filteredPrs = filterPrs(pullRequests, timeGranularity)

  await writeFile('./pullRequestsFiltered.json', JSON.stringify(filteredPrs, null, 2), {
    flag: 'w',
  })

  return filteredPrs
}

export { filterPrs, fetchFilteredPrs }
