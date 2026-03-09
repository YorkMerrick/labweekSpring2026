import type { PR } from "../types/pr"
import type { RepoData } from "../types/repoData"
import type { Comment } from "../types/comments"

class PipelineService {
    prFetcher: (repoData: RepoData) => Promise<PR[]>
    commentFetcher: (prNumber: number, repoData: RepoData) => Promise<Comment[]>

    constructor(
        prFetcher: (repoData: RepoData) => Promise<PR[]>, 
        commentFetcher: (prNumber: number, repoData: RepoData) => Promise<Comment[]>
    ) {
        this.prFetcher = prFetcher
        this.commentFetcher = commentFetcher
    }

    async getComments(repoData: RepoData) {
        const listOfPrs: PR[] = await this.prFetcher(repoData)
        const listOfComments: Comment[] = []

        for (const pr of listOfPrs) {
            const comments = await this.commentFetcher(pr.number, repoData)
            listOfComments.push(...comments)
        }

        return listOfComments
    }
}

export { PipelineService }