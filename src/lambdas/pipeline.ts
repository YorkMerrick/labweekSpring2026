import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import type { Comment } from '../types/comments'
import { PipelineService } from '../service/pipelineService'
import { fetchFilteredPrs } from '../api/github/fetchFilteredPrs'
import { fetchPrComments } from '../api/github/fetchPrComments'

const lambda = new LambdaClient({})
const secrets = new SecretsManagerClient({})
const targetFunctionName = process.env.TARGET_FUNCTION_NAME!
const secretArn = process.env.SECRET_ARN!

export const handler = async () => {
  // Get credentials, tokens, etc.
  const sec = await secrets.send(new GetSecretValueCommand({ SecretId: secretArn }))

  let data: Comment[]

  const repoData = {
    owner: 'sky-uk',
    repo: 'sky-sport-group-android',
  }

  new PipelineService(fetchFilteredPrs, fetchPrComments)
    .getComments(repoData)
    .then(async (fetchedComments) => {
      console.log(fetchedComments)
      await lambda.send(
        new InvokeCommand({
          FunctionName: targetFunctionName,
          InvocationType: 'RequestResponse',
          Payload: JSON.stringify(fetchedComments, null, 2),
        })
      )
    })
    .catch((error) => {
      console.error('Error fetching comments:', error)
    })

  return { ok: true, statusCode: 200 }
}
