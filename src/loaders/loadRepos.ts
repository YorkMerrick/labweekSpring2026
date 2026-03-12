import fs from 'fs'
import type { RepoData } from '../types/repo.js'

export function loadRepos(filePath = 'input.json'): RepoData[] {
  const raw = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(raw) as RepoData[]
}
