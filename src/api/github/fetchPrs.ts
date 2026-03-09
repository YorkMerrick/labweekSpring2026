import { octokit } from '../../client/octokit'
import type { PR } from '../../types/pr'
import type { RepoData } from '../../types/repoData'

async function fetchPrs(repoData: RepoData): Promise<PR[]> {
  const rawPrs = await octokit.rest.pulls
    .list({
      owner: repoData.owner,
      repo: repoData.repo,
      state: 'closed',
      per_page: 100,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error fetching PRs:', error)
      return []
    })

  const simplePrs: PR[] = rawPrs.map((pr) => ({
    number: pr.number,
    title: pr.title,
    author: pr.user?.login ?? 'unknown',
    url: pr.html_url,
    created_at: pr.created_at,
    last_updated: pr.updated_at,
  }))

  return simplePrs
}

export { fetchPrs }
