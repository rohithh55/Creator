"""
Initialize the database with sample AWS scenario-based interview questions
"""

from app import create_app, db
from models import User, InterviewQuestion, Badge

def initialize_interview_questions():
    """Add AWS scenario-based interview questions to the database"""
    
    aws_questions = [
        # Daily featured AWS questions - 35 questions
        {
            "question": "A company wants to migrate a 20TB Oracle database to AWS with minimal downtime. The company has a 1Gbps internet connection with consistent usage of 50%. What is the MOST time and cost-efficient AWS service to use for this database migration?",
            "field": "rds",
            "difficulty": "hard",
            "aws_service": "AWS Database Migration Service",
            "is_pinned": True
        },
        {
            "question": "A company is designing a web application architecture where the back-end API is hosted on Amazon EC2 instances and data is stored in Amazon DynamoDB. The company wants to ensure that if the primary region fails, the application can automatically fail over to a backup region with minimal data loss and downtime. Which combination of features should be used?",
            "field": "dynamodb",
            "difficulty": "hard",
            "aws_service": "DynamoDB Global Tables, Route 53",
            "is_pinned": True
        },
        {
            "question": "A Database Administrator needs to migrate an on-premises Microsoft SQL Server database to AWS. The database is used for an online transaction processing (OLTP) application that has very strict performance requirements. Which AWS service should be used for this migration to minimize disruption and ensure performance?",
            "field": "rds",
            "difficulty": "medium",
            "aws_service": "Amazon RDS for SQL Server",
            "is_pinned": True
        },
        {
            "question": "A DynamoDB table is experiencing throttling on read operations during peak business hours, but performs normally during off-peak hours. The application using this table cannot tolerate any read throttling. What is the MOST cost-effective way to eliminate the throttling?",
            "field": "dynamodb",
            "difficulty": "medium",
            "aws_service": "DynamoDB Auto Scaling",
            "is_pinned": True
        },
        {
            "question": "A company has a legacy application that uses a PostgreSQL database for both transactional and analytical queries. The analytical queries are resource-intensive and impact the performance of transaction processing. How can the company improve performance of both workloads with minimal changes to the application?",
            "field": "rds",
            "difficulty": "medium",
            "aws_service": "Aurora PostgreSQL",
            "is_pinned": True
        },
        # General AWS Questions
        {
            "question": "You're designing a web application that needs to store user profile pictures. The application will have millions of users, and the images need to be served with low latency globally. Which AWS services would you use for this scenario and why?",
            "field": "aws_general",
            "difficulty": "medium",
            "aws_service": "S3, CloudFront",
            "is_pinned": False
        },
        {
            "question": "Your company processes large amounts of IoT sensor data that arrives in real-time and needs to be analyzed for anomalies. The processed data must be stored for long-term analysis. Design an AWS architecture for ingesting, processing, and storing this data efficiently.",
            "field": "aws_general",
            "difficulty": "hard",
            "aws_service": "Kinesis, Lambda",
            "is_pinned": False
        },
        {
            "question": "You're architecting a multi-region active-active setup for a critical application that needs to remain available even if an entire AWS region goes down. How would you design the database layer to ensure data consistency across regions?",
            "field": "aws_general",
            "difficulty": "hard",
            "aws_service": "DynamoDB Global Tables, Aurora Global Database",
            "is_pinned": False
        },
        
        # EC2 Questions
        {
            "question": "Your company has a three-tier web application deployed on EC2 instances. The application experiences high traffic during business hours (9 AM - 5 PM) but very little traffic outside those hours. How would you optimize the AWS infrastructure costs while ensuring the application remains responsive during peak times?",
            "field": "ec2",
            "difficulty": "medium",
            "aws_service": "EC2, Auto Scaling",
            "is_pinned": True
        },
        
        # RDS and Database Questions
        {
            "question": "You're migrating a large on-premises Oracle database to AWS. The database is currently 5TB in size and has stringent performance requirements with less than 100ms response times for transactions. What AWS database solution would you recommend and what migration strategy would you use?",
            "field": "rds",
            "difficulty": "hard",
            "aws_service": "RDS, DMS",
            "is_pinned": False
        },
        {
            "question": "Your company is running a production database on Amazon RDS Multi-AZ deployment. During a routine performance review, you notice that database read performance is degrading due to increased traffic. What AWS service can help improve performance without increasing costs significantly?",
            "field": "rds",
            "difficulty": "medium",
            "aws_service": "RDS Read Replicas",
            "is_pinned": True
        },
        {
            "question": "You need to scale your PostgreSQL database on RDS. You're experiencing high read traffic but relatively low write traffic. The database is critical for your business operations. What is the most effective way to scale the database while ensuring high availability?",
            "field": "rds",
            "difficulty": "medium",
            "aws_service": "RDS, Aurora PostgreSQL",
            "is_pinned": False
        },
        {
            "question": "A financial services company needs to migrate their on-premises SQL Server database to AWS with minimal downtime. The database is 1TB in size and experiences high transaction volumes during market hours. What migration approach would you recommend and which AWS services would you use?",
            "field": "rds",
            "difficulty": "hard",
            "aws_service": "RDS, DMS, Schema Conversion Tool",
            "is_pinned": False
        },
        {
            "question": "Your company has an RDS MySQL database that needs to be highly available and must support automatic failover. Which RDS feature should be enabled, and how does it work?",
            "field": "rds",
            "difficulty": "medium",
            "aws_service": "RDS Multi-AZ",
            "is_pinned": False
        },
        {
            "question": "You notice that your Amazon RDS instance is experiencing performance issues during peak hours. After investigation, you find that the main cause is the high number of read operations. What's the most cost-effective solution to address this issue?",
            "field": "rds",
            "difficulty": "medium",
            "aws_service": "RDS Read Replicas",
            "is_pinned": False
        },
        {
            "question": "You're designing a solution that requires a relational database with millisecond latency, high throughput, and the ability to scale storage automatically. The database will start small but potentially grow to several terabytes. Which AWS database service should you choose?",
            "field": "rds",
            "difficulty": "medium",
            "aws_service": "Aurora",
            "is_pinned": False
        },
        {
            "question": "Your RDS database needs to be encrypted at rest for compliance reasons. How would you implement this for an existing database that is currently unencrypted?",
            "field": "rds",
            "difficulty": "medium",
            "aws_service": "RDS Encryption, KMS",
            "is_pinned": False
        },
        {
            "question": "Your company has an RDS SQL Server instance with a database that has many stored procedures. You need to migrate to a different database engine to reduce licensing costs. What AWS service would help with this migration?",
            "field": "rds",
            "difficulty": "hard",
            "aws_service": "AWS Schema Conversion Tool",
            "is_pinned": False
        },
        {
            "question": "Your database on Amazon RDS needs to be available across multiple AWS regions for disaster recovery purposes. What option provides the lowest RTO (Recovery Time Objective) while ensuring data consistency?",
            "field": "rds",
            "difficulty": "hard",
            "aws_service": "Aurora Global Database",
            "is_pinned": False
        },
        
        # DynamoDB Questions
        {
            "question": "Your e-commerce application stores order data in DynamoDB. The application now needs to trigger different processes when new orders are placed, such as sending confirmation emails, updating inventory, and notifying the fulfillment center. How would you implement this in a decoupled way using AWS services?",
            "field": "dynamodb",
            "difficulty": "medium",
            "aws_service": "DynamoDB, Lambda, SNS",
            "is_pinned": False
        },
        {
            "question": "You're designing a DynamoDB table for a mobile gaming application that needs to track player scores. You need to query data by both player_id and game_id. What's the best approach for designing the partition key and sort key?",
            "field": "dynamodb",
            "difficulty": "medium",
            "aws_service": "DynamoDB",
            "is_pinned": True
        },
        {
            "question": "Your application uses DynamoDB and experiences predictable high-traffic periods each day. During these periods, the application sometimes encounters ProvisionedThroughputExceededException errors. What's the most cost-effective solution to handle this traffic pattern?",
            "field": "dynamodb",
            "difficulty": "medium",
            "aws_service": "DynamoDB Auto Scaling",
            "is_pinned": False
        },
        {
            "question": "You need to implement a feature where items in your DynamoDB table are automatically deleted after a certain time period. How would you achieve this?",
            "field": "dynamodb",
            "difficulty": "medium",
            "aws_service": "DynamoDB TTL",
            "is_pinned": False
        },
        {
            "question": "Your DynamoDB application needs to maintain a secondary index on a non-key attribute for efficient querying. What type of index would you create, and what are the considerations?",
            "field": "dynamodb",
            "difficulty": "medium",
            "aws_service": "DynamoDB Global Secondary Index",
            "is_pinned": False
        },
        {
            "question": "Your company has a multi-region application that uses DynamoDB. You need to ensure that data is replicated across regions with minimal latency. What feature would you use?",
            "field": "dynamodb",
            "difficulty": "hard",
            "aws_service": "DynamoDB Global Tables",
            "is_pinned": False
        },
        {
            "question": "You're implementing a shopping cart feature in your e-commerce application using DynamoDB. The cart needs to hold multiple items and be updated frequently as users add and remove items. How would you model this data in DynamoDB?",
            "field": "dynamodb",
            "difficulty": "hard",
            "aws_service": "DynamoDB",
            "is_pinned": False
        },
        {
            "question": "Your application is reading data from a DynamoDB table and needs to ensure consistency across all reads. What consistency option should you choose, and what are the trade-offs?",
            "field": "dynamodb",
            "difficulty": "medium",
            "aws_service": "DynamoDB Consistency Models",
            "is_pinned": False
        },
        {
            "question": "Your application needs to perform a transaction that includes multiple operations on DynamoDB items, and all operations must succeed or fail together. How would you implement this?",
            "field": "dynamodb",
            "difficulty": "medium",
            "aws_service": "DynamoDB Transactions",
            "is_pinned": False
        },
        {
            "question": "You need to implement a leaderboard for a global gaming application using DynamoDB, where you frequently need to retrieve the top 100 players. How would you design this solution?",
            "field": "dynamodb",
            "difficulty": "hard",
            "aws_service": "DynamoDB, GSI",
            "is_pinned": False
        },
        
        # S3 Questions
        {
            "question": "You have sensitive customer data that needs to be stored in S3. Your security team requires that this data be encrypted and that the encryption keys be rotated regularly. How would you set up S3 to meet these requirements?",
            "field": "s3",
            "difficulty": "medium",
            "aws_service": "S3, KMS",
            "is_pinned": False
        },
        
        # Lambda Questions
        {
            "question": "Your Lambda function needs to access a private RDS database in a VPC. However, the function is timing out when trying to connect to the database. What might be causing this issue and how would you resolve it?",
            "field": "lambda",
            "difficulty": "medium",
            "aws_service": "Lambda, VPC",
            "is_pinned": True
        },
        
        # Security Questions
        {
            "question": "Your company is implementing a microservices architecture for a new application. Each microservice needs to communicate with others securely, and you need to implement proper authentication and authorization. How would you design this using AWS services?",
            "field": "security",
            "difficulty": "hard",
            "aws_service": "IAM, Cognito, API Gateway",
            "is_pinned": False
        },
        {
            "question": "Your company is required to maintain audit logs for all changes made to AWS infrastructure for compliance reasons. How would you implement a comprehensive audit trail for all AWS account activity?",
            "field": "security",
            "difficulty": "medium",
            "aws_service": "CloudTrail, Config",
            "is_pinned": False
        },
        
        # IAM Questions
        {
            "question": "Your company is using a single AWS account for all environments (development, testing, staging, production). This is causing issues with access control and cost tracking. How would you reorganize the AWS account structure and implement proper governance?",
            "field": "iam",
            "difficulty": "medium",
            "aws_service": "AWS Organizations, IAM",
            "is_pinned": False
        },
        
        # EKS Questions
        {
            "question": "You need to deploy a containerized application that consists of multiple services that need to scale independently based on different metrics. The application also needs service discovery and load balancing. How would you design this architecture in AWS?",
            "field": "eks",
            "difficulty": "hard",
            "aws_service": "EKS, ECR, ECS",
            "is_pinned": False
        },
        
        # CloudWatch Questions
        {
            "question": "Your application is experiencing intermittent performance issues. You suspect it might be related to the database. How would you use AWS monitoring and logging services to identify and resolve the root cause?",
            "field": "cloudwatch",
            "difficulty": "medium",
            "aws_service": "CloudWatch, X-Ray",
            "is_pinned": False
        },
        
        # CloudFormation Questions
        {
            "question": "Your team wants to implement Infrastructure as Code for all AWS resources. They're debating between using AWS CloudFormation and Terraform. What are the pros and cons of each approach for AWS infrastructure provisioning?",
            "field": "cloudformation",
            "difficulty": "medium",
            "aws_service": "CloudFormation",
            "is_pinned": True
        },
        
        # VPC Questions
        {
            "question": "You're designing a VPC for a new application that has public-facing web servers, application servers that should not be directly accessible from the internet, and a database tier. How would you structure the subnets, route tables, and security groups to ensure proper security?",
            "field": "vpc",
            "difficulty": "medium",
            "aws_service": "VPC, Subnets, Security Groups",
            "is_pinned": False
        }
    ]
    
    # Additional specialized questions by AWS service
    
    # IAM Questions
    iam_questions = [
        {
            "question": "Your company has multiple departments with different AWS resource access requirements. How would you implement the principle of least privilege using IAM?",
            "field": "iam",
            "difficulty": "medium",
            "aws_service": "IAM",
            "is_pinned": True
        },
        {
            "question": "Your company has recently had a security audit that revealed some IAM users have excessive permissions. What AWS tools and best practices would you implement to address this issue?",
            "field": "iam",
            "difficulty": "medium",
            "aws_service": "IAM, AWS Config",
            "is_pinned": False
        },
        {
            "question": "You need to allow an EC2 instance to access an S3 bucket without using access keys. What is the most secure way to achieve this?",
            "field": "iam",
            "difficulty": "medium",
            "aws_service": "IAM Roles",
            "is_pinned": False
        },
        {
            "question": "A developer on your team needs temporary access to a specific S3 bucket to troubleshoot an issue. How would you provide this access in the most secure way?",
            "field": "iam",
            "difficulty": "medium",
            "aws_service": "IAM",
            "is_pinned": False
        },
        {
            "question": "You want to implement Multi-Factor Authentication (MFA) for all IAM users who access the AWS Management Console. How would you enforce this requirement?",
            "field": "iam",
            "difficulty": "medium",
            "aws_service": "IAM",
            "is_pinned": False
        }
    ]
    
    # VPC Questions
    vpc_questions = [
        {
            "question": "You're designing a multi-tier architecture in AWS with public-facing web servers and private database servers. How would you configure the VPC, subnets, and routing to ensure proper security?",
            "field": "vpc",
            "difficulty": "medium",
            "aws_service": "VPC, Subnets, Route Tables",
            "is_pinned": True
        },
        {
            "question": "Your application in a private subnet needs to access AWS services like S3 but should not be accessible from the internet. How would you configure this?",
            "field": "vpc",
            "difficulty": "medium",
            "aws_service": "VPC Endpoints",
            "is_pinned": False
        },
        {
            "question": "You have two VPCs that need to communicate with each other. What are the different options to enable this communication, and what are the tradeoffs?",
            "field": "vpc",
            "difficulty": "medium",
            "aws_service": "VPC Peering, Transit Gateway",
            "is_pinned": False
        },
        {
            "question": "You need to implement network-level security for your EC2 instances. Explain the differences between security groups and network ACLs, and when you would use each.",
            "field": "vpc",
            "difficulty": "medium",
            "aws_service": "Security Groups, Network ACLs",
            "is_pinned": False
        },
        {
            "question": "You need to connect your on-premises network to AWS. What options are available, and how would you choose between them?",
            "field": "vpc",
            "difficulty": "hard",
            "aws_service": "VPN, Direct Connect",
            "is_pinned": False
        }
    ]
    
    # EC2 Questions
    ec2_questions = [
        {
            "question": "Your organization needs to deploy a large number of EC2 instances for a batch processing workload with varying requirements. How would you choose the most cost-effective instance purchasing option?",
            "field": "ec2",
            "difficulty": "medium",
            "aws_service": "EC2, Spot Instances, Reserved Instances",
            "is_pinned": True
        },
        {
            "question": "You need to deploy an application that requires high availability and fault tolerance. How would you design your EC2 deployment to meet these requirements?",
            "field": "ec2",
            "difficulty": "medium",
            "aws_service": "EC2, Auto Scaling, ELB",
            "is_pinned": False
        },
        {
            "question": "Your EC2 instances need to maintain session state, but you also need to enable auto-scaling. How would you handle this?",
            "field": "ec2",
            "difficulty": "medium",
            "aws_service": "EC2, ElastiCache, DynamoDB",
            "is_pinned": False
        },
        {
            "question": "Your application's EC2 instances need to interact with several other AWS services securely. What's the best practice for granting these permissions?",
            "field": "ec2",
            "difficulty": "medium",
            "aws_service": "EC2, IAM",
            "is_pinned": False
        },
        {
            "question": "Your EC2 instances occasionally need to process large volumes of data, but for most of the time, they're underutilized. How would you optimize costs while maintaining performance when needed?",
            "field": "ec2",
            "difficulty": "medium",
            "aws_service": "EC2, Auto Scaling",
            "is_pinned": False
        }
    ]
    
    # S3 Questions
    s3_questions = [
        {
            "question": "Your company needs to store large amounts of data in S3 with various access patterns. Some data is accessed frequently, some is rarely accessed, and some needs to be archived. How would you design a cost-effective storage solution?",
            "field": "s3",
            "difficulty": "medium",
            "aws_service": "S3 Storage Classes",
            "is_pinned": True
        },
        {
            "question": "You need to ensure that all data uploaded to your S3 bucket is encrypted. What options are available, and how would you enforce this requirement?",
            "field": "s3",
            "difficulty": "medium",
            "aws_service": "S3 Encryption",
            "is_pinned": False
        },
        {
            "question": "Your application needs to grant temporary access to specific objects in an S3 bucket to unauthenticated users. How would you implement this securely?",
            "field": "s3",
            "difficulty": "medium",
            "aws_service": "S3 Presigned URLs",
            "is_pinned": False
        },
        {
            "question": "Your company needs to implement a lifecycle policy for S3 objects to control costs. What kinds of transitions and expiration rules would you implement?",
            "field": "s3",
            "difficulty": "medium",
            "aws_service": "S3 Lifecycle Policies",
            "is_pinned": False
        },
        {
            "question": "You need to replicate data in an S3 bucket to another region for disaster recovery. How would you configure this, and what are the considerations?",
            "field": "s3",
            "difficulty": "medium",
            "aws_service": "S3 Cross-Region Replication",
            "is_pinned": False
        }
    ]
    
    # EKS Questions
    eks_questions = [
        {
            "question": "Your organization is moving toward container-based deployments and is considering Amazon EKS. What are the key components of an EKS architecture, and how would you design for high availability?",
            "field": "eks",
            "difficulty": "hard",
            "aws_service": "EKS",
            "is_pinned": True
        },
        {
            "question": "You need to deploy a Kubernetes application on EKS with specific networking requirements. How would you configure the networking aspects of your EKS cluster?",
            "field": "eks",
            "difficulty": "hard",
            "aws_service": "EKS, VPC CNI",
            "is_pinned": False
        },
        {
            "question": "Your EKS-based application needs to interact with other AWS services securely. How would you manage IAM permissions for pods running in your EKS cluster?",
            "field": "eks",
            "difficulty": "hard",
            "aws_service": "EKS, IAM Roles for Service Accounts",
            "is_pinned": False
        },
        {
            "question": "You need to implement monitoring and logging for your EKS cluster and the applications running on it. What AWS services would you use?",
            "field": "eks",
            "difficulty": "medium",
            "aws_service": "EKS, CloudWatch, Container Insights",
            "is_pinned": False
        },
        {
            "question": "Your organization needs to automate the deployment of applications to your EKS cluster. What approach and tools would you recommend?",
            "field": "eks",
            "difficulty": "hard",
            "aws_service": "EKS, AWS CodePipeline, ArgoCD",
            "is_pinned": False
        }
    ]
    
    # Route53 Questions
    route53_questions = [
        {
            "question": "Your company is migrating to AWS and needs to implement a DNS strategy. How would you use Route 53 to manage different types of DNS records and routing policies?",
            "field": "route53",
            "difficulty": "medium",
            "aws_service": "Route 53",
            "is_pinned": True
        },
        {
            "question": "You have a multi-region application deployment and need to route users to the closest region for the lowest latency. How would you configure this with Route 53?",
            "field": "route53",
            "difficulty": "medium",
            "aws_service": "Route 53 Latency Routing",
            "is_pinned": False
        },
        {
            "question": "Your application needs to failover to a backup endpoint if the primary endpoint becomes unhealthy. How would you implement this using Route 53?",
            "field": "route53",
            "difficulty": "medium",
            "aws_service": "Route 53 Health Checks, Failover Routing",
            "is_pinned": False
        },
        {
            "question": "You need to gradually migrate traffic from an on-premises application to AWS. How would you use Route 53 to implement a controlled migration strategy?",
            "field": "route53",
            "difficulty": "medium",
            "aws_service": "Route 53 Weighted Routing",
            "is_pinned": False
        },
        {
            "question": "Your organization has multiple AWS accounts and wants to centralize DNS management. How would you implement a shared DNS architecture using Route 53?",
            "field": "route53",
            "difficulty": "hard",
            "aws_service": "Route 53, Private Hosted Zones",
            "is_pinned": False
        }
    ]
    
    # CloudWatch Questions
    cloudwatch_questions = [
        {
            "question": "Your application is experiencing intermittent performance issues, and you need to identify the root cause. How would you use CloudWatch to monitor and troubleshoot the problem?",
            "field": "cloudwatch",
            "difficulty": "medium",
            "aws_service": "CloudWatch",
            "is_pinned": True
        },
        {
            "question": "You need to implement automated responses to specific events in your AWS environment. How would you use CloudWatch and other AWS services to achieve this?",
            "field": "cloudwatch",
            "difficulty": "medium",
            "aws_service": "CloudWatch Alarms, EventBridge",
            "is_pinned": False
        },
        {
            "question": "Your organization needs detailed monitoring of custom metrics for your application. How would you implement this using CloudWatch?",
            "field": "cloudwatch",
            "difficulty": "medium",
            "aws_service": "CloudWatch Custom Metrics",
            "is_pinned": False
        },
        {
            "question": "You need to collect and analyze logs from multiple AWS services and resources. How would you implement a centralized logging solution?",
            "field": "cloudwatch",
            "difficulty": "medium",
            "aws_service": "CloudWatch Logs",
            "is_pinned": False
        },
        {
            "question": "Your team needs to create dashboards to visualize metrics from multiple AWS services. How would you implement this using CloudWatch?",
            "field": "cloudwatch",
            "difficulty": "medium",
            "aws_service": "CloudWatch Dashboards",
            "is_pinned": False
        }
    ]
    
    # Terraform Questions
    terraform_questions = [
        {
            "question": "Your organization has decided to use Terraform for infrastructure as code on AWS. How would you approach designing a modular and maintainable Terraform codebase for multiple environments?",
            "field": "terraform",
            "difficulty": "hard",
            "aws_service": "Terraform",
            "is_pinned": True
        },
        {
            "question": "You need to manage sensitive information like database credentials in your Terraform code. What are the best practices for handling secrets in Terraform?",
            "field": "terraform",
            "difficulty": "medium",
            "aws_service": "Terraform, AWS Secrets Manager",
            "is_pinned": False
        },
        {
            "question": "Your team is working on multiple Terraform projects and needs to share state and provision resources across them. How would you implement this?",
            "field": "terraform",
            "difficulty": "hard",
            "aws_service": "Terraform, S3 Remote State",
            "is_pinned": False
        },
        {
            "question": "You need to implement a CI/CD pipeline for your Terraform code to automatically apply changes when code is pushed to a repository. How would you design this pipeline?",
            "field": "terraform",
            "difficulty": "hard",
            "aws_service": "Terraform, AWS CodePipeline",
            "is_pinned": False
        },
        {
            "question": "You're migrating existing AWS infrastructure to be managed by Terraform. What approach would you take to import existing resources?",
            "field": "terraform",
            "difficulty": "medium",
            "aws_service": "Terraform",
            "is_pinned": False
        }
    ]
    
    aws_questions.extend(iam_questions + vpc_questions + ec2_questions + s3_questions + eks_questions + route53_questions + cloudwatch_questions + terraform_questions)
    
    # Add questions to the database
    for q_data in aws_questions:
        question = InterviewQuestion(
            question=q_data["question"],
            field=q_data["field"],
            difficulty=q_data["difficulty"],
            aws_service=q_data["aws_service"],
            is_pinned=q_data["is_pinned"]
        )
        db.session.add(question)
    
    # Create badges for AWS expertise
    aws_badges = [
        {
            "name": "AWS Solver",
            "description": "Answered 5+ AWS interview questions",
            "category": "interview",
            "image_url": "/static/images/badges/aws-solver.png"
        },
        {
            "name": "AWS Expert",
            "description": "Received 10+ upvotes on AWS answers",
            "category": "interview",
            "image_url": "/static/images/badges/aws-expert.png"
        },
        {
            "name": "AWS Guru",
            "description": "Answered questions in 5+ different AWS service categories",
            "category": "interview",
            "image_url": "/static/images/badges/aws-guru.png"
        },
        {
            "name": "Community Helper",
            "description": "Actively participating in the AWS community",
            "category": "community",
            "image_url": "/static/images/badges/community-helper.png"
        }
    ]
    
    # Add badges to the database
    for b_data in aws_badges:
        badge = Badge(
            name=b_data["name"],
            description=b_data["description"],
            category=b_data["category"],
            image_url=b_data["image_url"]
        )
        db.session.add(badge)
    
    # Commit all changes
    db.session.commit()
    print("AWS interview questions and badges initialized successfully!")

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        initialize_interview_questions()