# AWS Job Search Application Deployment

This directory contains deployment configurations and instructions for deploying the AWS Job Search application to production environments.

## Deployment Options

### Terraform (Recommended)

The `terraform` directory contains Infrastructure as Code (IaC) configurations to deploy the application on AWS using Terraform. This approach allows for consistent, repeatable deployments and easier infrastructure management.

Key features of the Terraform deployment:
- Provisions a VPC with public and private subnets
- Deploys an EC2 instance with the application
- Sets up security groups for proper network access
- Optional RDS PostgreSQL database configuration
- Optional Elastic Load Balancer configuration
- Automated installation and configuration via user data script

See the [Terraform README](terraform/README.md) for detailed deployment instructions.

## Deployment Requirements

### Database

The application requires a PostgreSQL database. You can choose between:
1. Local PostgreSQL database on the EC2 instance (default configuration)
2. Amazon RDS PostgreSQL database (recommended for production)

### SSL/TLS

For production deployments, it's recommended to use HTTPS:
1. Register a domain name
2. Create an SSL certificate using AWS Certificate Manager
3. Configure the load balancer to use HTTPS

### Backups

For production deployments, consider setting up:
1. RDS automated backups
2. EC2 AMI backup schedule
3. Database dump backups to S3

## Deployment Architecture

The default deployment architecture includes:

```
                  ┌───────────────┐
                  │     Client    │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  Public IP/   │
                  │  Domain Name  │
                  └───────┬───────┘
                          │
                          ▼
┌────────────────────────────────────────┐
│               VPC                       │
│  ┌────────────────────────────────┐    │
│  │        Public Subnet           │    │
│  │  ┌─────────────────────────┐   │    │
│  │  │      EC2 Instance       │   │    │
│  │  │  ┌──────────────────┐   │   │    │
│  │  │  │  Nginx (Reverse  │   │   │    │
│  │  │  │     Proxy)       │   │   │    │
│  │  │  └────────┬─────────┘   │   │    │
│  │  │           │             │   │    │
│  │  │  ┌────────▼─────────┐   │   │    │
│  │  │  │  Flask Application│   │   │    │
│  │  │  └────────┬─────────┘   │   │    │
│  │  └──────────┬┴─────────────┘   │    │
│  └─────────────┼────────────────┬─┘    │
│                │                │      │
│  ┌─────────────▼────────────────▼─┐    │
│  │         Private Subnet         │    │
│  │  ┌──────────────────────────┐  │    │
│  │  │      PostgreSQL DB       │  │    │
│  │  └──────────────────────────┘  │    │
│  └─────────────────────────────────    │
└────────────────────────────────────────┘
```

For a more robust production setup with RDS and ELB, refer to the commented sections in the Terraform configuration files.