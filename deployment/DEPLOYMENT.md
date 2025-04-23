# AWS Job Search Application Deployment Guide

This guide provides comprehensive instructions for deploying the AWS Job Search Application to AWS using Terraform.

## Deployment Options

The application can be deployed using:

1. **Terraform (recommended)** - Infrastructure as Code approach for automated, consistent deployment
2. **Manual EC2 Deployment** - For development/testing environments

## Prerequisites

Before deployment, ensure you have:

- AWS CLI installed and configured with appropriate credentials
- Terraform v1.0.0 or newer installed
- SSH key pair created in your AWS account
- Domain name (optional, for HTTPS setup)

## Terraform Deployment (Production)

### Step 1: Configure Deployment Variables

1. Navigate to the `deployment/terraform` directory
2. Copy the example variables file:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```
3. Edit `terraform.tfvars` with your specific values:
   - `key_name` - Your SSH key pair name
   - `db_password` - Secure PostgreSQL password
   - `ssh_location` - Your IP address or CIDR block for SSH access
   - `aws_region` - Target AWS region (default: us-east-1)

### Step 2: Initialize and Deploy

Run the deployment script which will walk you through the process:

```bash
cd deployment/terraform
chmod +x deploy.sh
./deploy.sh
```

Or follow these manual steps:

```bash
# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply changes
terraform apply
```

Type `yes` when prompted to confirm the deployment.

### Step 3: Access the Application

After successful deployment, Terraform will output:
- `web_server_public_dns` - Public DNS name of the EC2 instance
- `web_server_public_ip` - Public IP address of the EC2 instance
- `website_url` - URL to access the web application

You can SSH into the instance for debugging or configuration:
```bash
ssh -i /path/to/your-key.pem ubuntu@<web_server_public_ip>
```

## Production Deployment Options

For a production deployment, consider enabling these additional components:

### 1. RDS Database (Instead of Local PostgreSQL)

For improved reliability and scalability, use Amazon RDS:

1. Edit `deployment/terraform/rds.tf` and uncomment the RDS configuration
2. Add a second availability zone in `terraform.tfvars`:
   ```
   availability_zone_2 = "us-east-1b"
   ```
3. Deploy using the standard procedure

### 2. Load Balancer and Auto Scaling

For high availability and scalability:

1. Edit `deployment/terraform/load_balancer.tf` and uncomment the ELB configuration
2. Deploy using the standard procedure
3. The load balancer DNS name will be provided in the outputs

### 3. HTTPS with AWS Certificate Manager

For secure HTTPS connections:

1. Register a domain name (via Route 53 or another provider)
2. Create an SSL certificate in AWS Certificate Manager
3. Uncomment the HTTPS listener section in `load_balancer.tf`
4. Add certificate ARN to `terraform.tfvars`:
   ```
   acm_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/uuid"
   ```
5. Deploy using the standard procedure

## Monitoring and Maintenance

### CloudWatch Integration

The EC2 instance is configured with CloudWatch for monitoring. View metrics in the AWS Console under CloudWatch.

### Logs

Important application logs are located at:

- Application logs: `/opt/aws-job-search/app.log`
- Server logs: `/opt/aws-job-search/server.log`
- Setup logs: `/var/log/user-data.log`

### Backup Strategy

The deployment includes:

1. **Database Backups**:
   - For RDS: Automated daily backups with 7-day retention
   - For local PostgreSQL: Manual backups to S3 (see `deployment/scripts/backup-db.sh`)

2. **Application Backups**:
   - The application code is stored in your version control system
   - Configuration settings are backed up to S3

### Updating the Application

To update the application:

1. SSH into the EC2 instance
2. Navigate to the application directory: `cd /opt/aws-job-search`
3. Pull the latest code: `git pull`
4. Restart the application: `sudo systemctl restart aws-job-search`

## Cleanup

When you no longer need the resources, you can destroy them to avoid incurring charges:

```bash
cd deployment/terraform
terraform destroy
```

Type `yes` when prompted to confirm the deletion of all resources.

## DynamoDB Integration (Optional)

If you prefer using DynamoDB instead of RDS for specific components of the application:

1. See `deployment/aws/dynamodb-tables.yaml` for the CloudFormation template
2. See `deployment/aws/dynamodb-cli-commands.md` for AWS CLI commands
3. See `deployment/aws/rds-vs-dynamodb.md` for guidance on when to use each database service

## Troubleshooting

If you encounter deployment issues:

1. **EC2 Instance Not Accessible**:
   - Check security group rules
   - Verify instance status in EC2 console
   - Check user data script logs: `cat /var/log/user-data.log`

2. **Application Not Starting**:
   - Check application logs: `sudo journalctl -u aws-job-search`
   - Verify database connection: `sudo -u app_user psql -h localhost -U aws_job_admin -d aws_job_search`

3. **Database Connection Issues**:
   - Verify PostgreSQL is running: `sudo systemctl status postgresql`
   - Check database logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`

## Security Considerations

The deployment includes these security measures:

1. **Network Security**:
   - VPC with public and private subnets
   - Security groups restricting access
   - SSH limited to specified IP addresses

2. **Application Security**:
   - Database credentials stored securely
   - Application runs as non-root user
   - HTTPS available for production

3. **Data Security**:
   - Database encryption at rest (with RDS)
   - Regular backups
   - IAM roles with least privilege principle

## Support

For additional support, contact the development team or refer to:

- AWS Documentation: https://docs.aws.amazon.com/
- Terraform Documentation: https://www.terraform.io/docs
- Project Repository: [Link to your repository]