export type Comment = {
  id: number
  author: string
  body: string
}

export type PR = {
  number: number
  title: string
  authorName: string
  authorEmail: string
  url: string
  createdAt: string
  lastUpdated: string
}

export type RepoData = {
  owner: string
  repo: string
}

export type PRWithComments = {
  pr: PR
  comments: Comment[]
}
