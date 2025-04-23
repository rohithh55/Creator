# AWS DynamoDB CLI Commands for AWS Job Search Application

This document provides useful AWS CLI commands for managing DynamoDB tables for the AWS Job Search application. These commands can be run from the AWS CLI after it's been configured with appropriate credentials.

## Prerequisites

Make sure you have:
1. AWS CLI installed and configured
2. Appropriate IAM permissions to create and manage DynamoDB tables

## Creating Tables

### Users Table

```bash
aws dynamodb create-table \
    --table-name AWS_JobSearch_Users \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
        AttributeName=email,AttributeType=S \
    --key-schema AttributeName=userId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --global-secondary-indexes \
        "IndexName=EmailIndex,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL}" \
    --tags Key=Application,Value="AWS Job Search"
```

### Jobs Table

```bash
aws dynamodb create-table \
    --table-name AWS_JobSearch_Jobs \
    --attribute-definitions \
        AttributeName=jobId,AttributeType=S \
        AttributeName=companyName,AttributeType=S \
        AttributeName=postedDate,AttributeType=S \
    --key-schema AttributeName=jobId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --global-secondary-indexes \
        "IndexName=CompanyDateIndex,KeySchema=[{AttributeName=companyName,KeyType=HASH},{AttributeName=postedDate,KeyType=RANGE}],Projection={ProjectionType=ALL}" \
    --tags Key=Application,Value="AWS Job Search"
```

### Applications Table

```bash
aws dynamodb create-table \
    --table-name AWS_JobSearch_Applications \
    --attribute-definitions \
        AttributeName=applicationId,AttributeType=S \
        AttributeName=userId,AttributeType=S \
        AttributeName=applicationDate,AttributeType=S \
    --key-schema AttributeName=applicationId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --global-secondary-indexes \
        "IndexName=UserApplicationsIndex,KeySchema=[{AttributeName=userId,KeyType=HASH},{AttributeName=applicationDate,KeyType=RANGE}],Projection={ProjectionType=ALL}" \
    --tags Key=Application,Value="AWS Job Search"
```

### Interview Questions Table

```bash
aws dynamodb create-table \
    --table-name AWS_JobSearch_InterviewQuestions \
    --attribute-definitions \
        AttributeName=questionId,AttributeType=S \
        AttributeName=awsService,AttributeType=S \
        AttributeName=difficulty,AttributeType=S \
    --key-schema AttributeName=questionId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --global-secondary-indexes \
        "IndexName=ServiceDifficultyIndex,KeySchema=[{AttributeName=awsService,KeyType=HASH},{AttributeName=difficulty,KeyType=RANGE}],Projection={ProjectionType=ALL}" \
    --tags Key=Application,Value="AWS Job Search"
```

### User Answers Table

```bash
aws dynamodb create-table \
    --table-name AWS_JobSearch_UserAnswers \
    --attribute-definitions \
        AttributeName=answerId,AttributeType=S \
        AttributeName=userId,AttributeType=S \
        AttributeName=questionId,AttributeType=S \
    --key-schema AttributeName=answerId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --global-secondary-indexes \
        "IndexName=UserAnswersIndex,KeySchema=[{AttributeName=userId,KeyType=HASH},{AttributeName=questionId,KeyType=RANGE}],Projection={ProjectionType=ALL}" \
    --tags Key=Application,Value="AWS Job Search"
```

## Adding Sample Data

### Add a User

```bash
aws dynamodb put-item \
    --table-name AWS_JobSearch_Users \
    --item '{
        "userId": {"S": "user1"},
        "email": {"S": "user1@example.com"},
        "fullName": {"S": "John Doe"},
        "createdAt": {"S": "'$(date -Iseconds)'"},
        "awsExperience": {"N": "2"},
        "linkedInProfile": {"S": "https://linkedin.com/in/johndoe"}
    }'
```

### Add an Interview Question

```bash
aws dynamodb put-item \
    --table-name AWS_JobSearch_InterviewQuestions \
    --item '{
        "questionId": {"S": "q1"},
        "awsService": {"S": "RDS"},
        "question": {"S": "Explain the differences between RDS and DynamoDB and when to use each."},
        "difficulty": {"S": "medium"},
        "category": {"S": "Database"}
    }'
```

## Querying Data

### Query Jobs from a Specific Company

```bash
aws dynamodb query \
    --table-name AWS_JobSearch_Jobs \
    --index-name CompanyDateIndex \
    --key-condition-expression "companyName = :company" \
    --expression-attribute-values '{
        ":company": {"S": "Amazon"}
    }'
```

### Query RDS Interview Questions

```bash
aws dynamodb query \
    --table-name AWS_JobSearch_InterviewQuestions \
    --index-name ServiceDifficultyIndex \
    --key-condition-expression "awsService = :service" \
    --expression-attribute-values '{
        ":service": {"S": "RDS"}
    }'
```

### Query User's Applications

```bash
aws dynamodb query \
    --table-name AWS_JobSearch_Applications \
    --index-name UserApplicationsIndex \
    --key-condition-expression "userId = :userId" \
    --expression-attribute-values '{
        ":userId": {"S": "user1"}
    }'
```

## Deleting Tables

### Delete All Tables

```bash
aws dynamodb delete-table --table-name AWS_JobSearch_Users
aws dynamodb delete-table --table-name AWS_JobSearch_Jobs
aws dynamodb delete-table --table-name AWS_JobSearch_Applications
aws dynamodb delete-table --table-name AWS_JobSearch_InterviewQuestions
aws dynamodb delete-table --table-name AWS_JobSearch_UserAnswers
```

## Backup and Restore

### Create On-Demand Backup

```bash
aws dynamodb create-backup \
    --table-name AWS_JobSearch_InterviewQuestions \
    --backup-name "interview-questions-backup-$(date +%Y%m%d)"
```

### List Backups

```bash
aws dynamodb list-backups
```

### Restore from Backup

```bash
aws dynamodb restore-table-from-backup \
    --target-table-name AWS_JobSearch_InterviewQuestions_Restored \
    --backup-arn ARN_OF_YOUR_BACKUP
```