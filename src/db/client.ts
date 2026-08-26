import { mkdirSync } from 'fs'
import type { AbstractSublevel } from 'abstract-level'
import { ClassicLevel } from 'classic-level'
import type { RepoData } from '../types/repo.js'
import type { StoredPr, StoredRepo } from './records.js'

const DEFAULT_DATABASE_PATH = './data/digest-level'

// Spelled out rather than inferred: the sublevel types come from
// abstract-level, and an inferred return type cannot name them portably, which
// breaks declaration output and non-flat node_modules layouts.
type Sublevel<V> = AbstractSublevel<
  ClassicLevel<string, string>,
  string | Buffer | Uint8Array,
  string,
  V
>

type Db = {
  repos: Sublevel<StoredRepo>
  prs: Sublevel<StoredPr>
  close: () => Promise<void>
}

// LevelDB keys are sorted lexicographically, so PR numbers are zero padded to
// keep that order numeric: unpadded, '10' would sort before '2'.
const PR_NUMBER_WIDTH = 10

function repoKey(repoData: RepoData): string {
  return `${repoData.owner}/${repoData.repo}`
}

function prKey(repoData: RepoData, prNumber: number): string {
  return `${repoKey(repoData)}/${String(prNumber).padStart(PR_NUMBER_WIDTH, '0')}`
}

function createDb(path: string = process.env.DATABASE_PATH ?? DEFAULT_DATABASE_PATH): Db {
  mkdirSync(path, { recursive: true })

  const level = new ClassicLevel(path)

  return {
    repos: level.sublevel<string, StoredRepo>('repos', { valueEncoding: 'json' }),
    prs: level.sublevel<string, StoredPr>('prs', { valueEncoding: 'json' }),
    // LevelDB holds an exclusive lock on the directory for as long as it is
    // open, so callers must close it to release the lock.
    close: () => level.close(),
  }
}

export { createDb, prKey, repoKey, DEFAULT_DATABASE_PATH, type Db }
