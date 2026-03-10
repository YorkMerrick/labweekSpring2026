import {
  Duration,
  Stack,
  type StackProps,
  aws_events as events,
  aws_events_targets as targets,
  aws_lambda as lambda,
  aws_lambda_nodejs as nodejs,
  aws_s3 as s3,
  aws_iam as iam,
  aws_secretsmanager as secrets,
  aws_logs as logs,
  App,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'

export class DigestStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props)

    // 2) Optional: secret for GitHub token / webhook URLs
    const secret = new secrets.Secret(this, 'WeeklyDigestSecrets', {
      secretName: 'weekly-digest/secrets',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          GITHUB_TOKEN: '',
          SLACK_WEBHOOK_URL: '',
          TEAMS_WEBHOOK_URL: '',
        }),
        generateStringKey: 'DUMMY_FILL_ME',
      },
    })

    const pipelineFn = new nodejs.NodejsFunction(this, 'PipelineFn', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: 'src/lambdas/pipeline.ts',
      handler: 'handler',
      timeout: Duration.minutes(5),
      environment: {
        SECRET_ARN: secret.secretArn,
      },
      logGroup: new logs.LogGroup(this, 'PipelineFnLogGroup', {
        retention: logs.RetentionDays.ONE_WEEK,
      }),
    })
    secret.grantRead(pipelineFn)

    // // 4) Agent Lambda: read JSON, call Bedrock, write Markdown to S3
    // const agentFn = new nodejs.NodejsFunction(this, 'AgentFn', {
    //   runtime: lambda.Runtime.NODEJS_20_X,
    //   entry: 'src/lambdas/agent/.ts',
    //   handler: 'handler',
    //   timeout: Duration.minutes(5),
    //   environment: {
    //     MODEL_ID: '', //"anthropic.claude-3-haiku-20240307", // or amazon.nova-lite-v1:0
    //   },
    //   logGroup: new logs.LogGroup(this, 'AgentFnLogGroup', {
    //     retention: logs.RetentionDays.ONE_WEEK,
    //   }),
    // })
  }
}
