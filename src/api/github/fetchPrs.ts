import { octokit } from '../clients/octokit.js'
import type { PR, RepoData } from '../../types/repo.js'

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
    authorName: pr.user?.name ?? pr.user?.login ?? null,
    authorEmail: pr.user?.email ?? null,
    url: pr.html_url,
    createdAt: pr.created_at,
    lastUpdated: pr.updated_at,
  }))

  return simplePrs
}

export { fetchPrs }
