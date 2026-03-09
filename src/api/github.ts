import type { PR } from '../types/pr'
import { octokit } from './octokit'

async function fetchPrs(): Promise<PR[]> {
  const rawPrs = await octokit.paginate(octokit.rest.pulls.list, {
    owner: 'YorkMerrick',
    repo: 'labweekSpring2026',
    state: 'open',
    per_page: 100,
  })

  const simplePrs: PR[] = rawPrs.map((pr) => ({
    number: pr.number,
    title: pr.title,
    author: pr.user?.login ?? 'unknown',
    url: pr.html_url,
    created_at: pr.created_at,
  }))

  return simplePrs
}

export { fetchPrs }
