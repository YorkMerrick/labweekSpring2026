#!/usr/bin/env node
import '../config'
import * as cdk from 'aws-cdk-lib'
import { DigestStack } from '../cdk/digestStack'

console.log('Starting CDK app...')
console.log(`CDK Default Region: ${process.env.AWS_DEFAULT_REGION}`)
console.log(`CDK Default Account: ${process.env.CDK_DEFAULT_ACCOUNT}`)

const app = new cdk.App()
new DigestStack(app, 'WeeklyDigestStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || '',
    region: process.env.AWS_DEFAULT_REGION || '',
  },
})
