import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const repos = sqliteTable(
  'repos',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    owner: text('owner').notNull(),
    repo: text('repo').notNull(),
    lastSyncedAt: text('last_synced_at'),
  },
  (table) => [uniqueIndex('repos_owner_repo_unique').on(table.owner, table.repo)]
)

export const prs = sqliteTable(
  'prs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    repoId: integer('repo_id')
      .notNull()
      .references(() => repos.id, { onDelete: 'cascade' }),
    number: integer('number').notNull(),
    title: text('title').notNull(),
    authorName: text('author_name'),
    authorEmail: text('author_email'),
    url: text('url').notNull(),
    createdAt: text('created_at').notNull(),
    lastUpdated: text('last_updated').notNull(),
    // The pr.lastUpdated value that reviews were last fetched for. Null means
    // never fetched. This is the freshness signal rather than a count of
    // comment rows, so PRs with zero Copilot reviews stay cached.
    reviewsSyncedForLastUpdated: text('reviews_synced_for_last_updated'),
    reviewsSyncedAt: text('reviews_synced_at'),
  },
  (table) => [uniqueIndex('prs_repo_id_number_unique').on(table.repoId, table.number)]
)

export const comments = sqliteTable(
  'comments',
  {
    // A surrogate key rather than GitHub's review id. Reviews are only ever
    // read back per PR and are replaced wholesale, so scoping ids locally keeps
    // a review id seen under two PRs from failing a global uniqueness check.
    // Insertion order is also preserved, which matters because the mapper
    // treats the first review as the PR's overview.
    id: integer('id').primaryKey({ autoIncrement: true }),
    prId: integer('pr_id')
      .notNull()
      .references(() => prs.id, { onDelete: 'cascade' }),
    githubId: integer('github_id').notNull(),
    author: text('author').notNull(),
    body: text('body').notNull(),
  },
  (table) => [index('comments_pr_id_idx').on(table.prId)]
)
