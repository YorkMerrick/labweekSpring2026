import { eq } from 'drizzle-orm'
import type { Db } from '../db/client.js'
import { comments } from '../db/schema.js'
import type { Comment } from '../types/repo.js'

function createCommentStore(db: Db) {
  function findCommentsForPr(prId: number): Comment[] {
    return (
      db
        .select({ id: comments.githubId, author: comments.author, body: comments.body })
        .from(comments)
        .where(eq(comments.prId, prId))
        // Ordered by the surrogate key so reviews come back in the order they
        // were fetched. The mapper treats the first one as the PR's overview, so
        // a cached read has to agree with what a fresh fetch would have returned.
        .orderBy(comments.id)
        .all()
    )
  }

  // Reviews for a PR are stored as a set, so a resync replaces them wholesale
  // rather than accumulating duplicates from earlier runs.
  function replaceCommentsForPr(prId: number, commentList: Comment[]): void {
    db.transaction((tx) => {
      tx.delete(comments).where(eq(comments.prId, prId)).run()

      if (commentList.length === 0) {
        return
      }

      tx.insert(comments)
        .values(
          commentList.map((comment) => ({
            prId,
            githubId: comment.id,
            author: comment.author,
            body: comment.body,
          }))
        )
        .run()
    })
  }

  return { findCommentsForPr, replaceCommentsForPr }
}

type CommentStore = ReturnType<typeof createCommentStore>

export { createCommentStore, type CommentStore }
