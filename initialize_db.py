"""
Initialize the database with sample AWS scenario-based interview questions
"""

from app import create_app, db
from models import User, InterviewQuestion, Badge

def initialize_interview_questions():
    """Add AWS scenario-based interview questions to the database"""
    
    aws_questions = [
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