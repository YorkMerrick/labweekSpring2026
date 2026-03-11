import { FilterTimeEnum } from '../../enums/filterTimeEnum.js'
import type { FilterTimePeriod } from '../../types/filterTimePeriod.js'
import type { PR, RepoData } from '../../types/repo.js'
import { getTimePeriodFromInterval } from '../utils/time.js'
import { fetchPrs } from './fetchPrs.js'
import { writeFile } from 'fs/promises'

function filterPrs(prs: PR[], timePeriod: FilterTimePeriod) {
  const fromDate = new Date(timePeriod.from)
  const toDate = new Date(timePeriod.to)

  return prs.filter((pr) => {
    const prDate = new Date(pr.lastUpdated)
    return prDate >= fromDate && prDate <= toDate
  })
}

async function fetchFilteredPrs(
  repoData: RepoData,
  interval: FilterTimeEnum = FilterTimeEnum.WEEK
) {
  const timeGranularity = getTimePeriodFromInterval(interval)
  const pullRequests = await fetchPrs(repoData)

  await writeFile('pullRequests.json', JSON.stringify(pullRequests, null, 2), { flag: 'w' })

  const filteredPrs = filterPrs(pullRequests, timeGranularity)

  await writeFile('pullRequestsFiltered.json', JSON.stringify(filteredPrs, null, 2), {
    flag: 'w',
  })

  return filteredPrs
}

export { filterPrs, fetchFilteredPrs }
