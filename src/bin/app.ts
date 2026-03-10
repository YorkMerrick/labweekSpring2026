#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { DigestStack } from '../cdk/digestStack'

const app = new cdk.App()
new DigestStack(app, 'WeeklyDigestStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT || '', region: 'eu-west-1' }, // choose your Bedrock region
})
