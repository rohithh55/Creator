# AWS CLI Deployment Guide for AWS Job Search Application

This guide provides manual AWS CLI commands to deploy the AWS Job Search Application. While the Terraform approach is recommended for production environments, these commands can be useful for development, testing, or in environments where Terraform cannot be used.

## Prerequisites

- AWS CLI installed and configured with appropriate credentials
- An SSH key pair created in AWS
- The application code ready for deployment

## VPC and Network Infrastructure

### Create VPC

```bash
# Create VPC
VPC_ID=$(aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=aws-job-search-vpc}]' \
  --query 'Vpc.VpcId' \
  --output text)

echo "VPC created: $VPC_ID"

# Enable DNS hostnames
aws ec2 modify-vpc-attribute \
  --vpc-id $VPC_ID \
  --enable-dns-hostnames "{\"Value\":true}"
```

### Create Internet Gateway

```bash
# Create Internet Gateway
IGW_ID=$(aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=aws-job-search-igw}]' \
  --query 'InternetGateway.InternetGatewayId' \
  --output text)

echo "Internet Gateway created: $IGW_ID"

# Attach IGW to VPC
aws ec2 attach-internet-gateway \
  --vpc-id $VPC_ID \
  --internet-gateway-id $IGW_ID
```

### Create Subnets

```bash
# Create public subnet
PUBLIC_SUBNET_ID=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=aws-job-search-public-subnet}]' \
  --query 'Subnet.SubnetId' \
  --output text)

echo "Public subnet created: $PUBLIC_SUBNET_ID"

# Create private subnet
PRIVATE_SUBNET_ID=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.2.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=aws-job-search-private-subnet}]' \
  --query 'Subnet.SubnetId' \
  --output text)

echo "Private subnet created: $PRIVATE_SUBNET_ID"

# Enable auto-assign public IP on public subnet
aws ec2 modify-subnet-attribute \
  --subnet-id $PUBLIC_SUBNET_ID \
  --map-public-ip-on-launch
```

### Create Route Tables

```bash
# Create public route table
PUBLIC_RT_ID=$(aws ec2 create-route-table \
  --vpc-id $VPC_ID \
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=aws-job-search-public-rt}]' \
  --query 'RouteTable.RouteTableId' \
  --output text)

echo "Public route table created: $PUBLIC_RT_ID"

# Create route to internet
aws ec2 create-route \
  --route-table-id $PUBLIC_RT_ID \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id $IGW_ID

# Associate public route table with public subnet
aws ec2 associate-route-table \
  --subnet-id $PUBLIC_SUBNET_ID \
  --route-table-id $PUBLIC_RT_ID
```

## Security Groups

```bash
# Create web server security group
WEB_SG_ID=$(aws ec2 create-security-group \
  --group-name aws-job-search-web-sg \
  --description "Security group for AWS Job Search web server" \
  --vpc-id $VPC_ID \
  --query 'GroupId' \
  --output text)

echo "Web security group created: $WEB_SG_ID"

# Add inbound rules for HTTP, HTTPS, SSH, and application port
aws ec2 authorize-security-group-ingress \
  --group-id $WEB_SG_ID \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $WEB_SG_ID \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $WEB_SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP_ADDRESS/32

aws ec2 authorize-security-group-ingress \
  --group-id $WEB_SG_ID \
  --protocol tcp \
  --port 8080 \
  --cidr 0.0.0.0/0

# Create database security group
DB_SG_ID=$(aws ec2 create-security-group \
  --group-name aws-job-search-db-sg \
  --description "Security group for AWS Job Search database" \
  --vpc-id $VPC_ID \
  --query 'GroupId' \
  --output text)

echo "Database security group created: $DB_SG_ID"

# Add inbound rule for PostgreSQL from web security group
aws ec2 authorize-security-group-ingress \
  --group-id $DB_SG_ID \
  --protocol tcp \
  --port 5432 \
  --source-group $WEB_SG_ID
```

## IAM Role for EC2

```bash
# Create IAM role
aws iam create-role \
  --role-name aws-job-search-web-server-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "ec2.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'

# Attach SSM policy to role
aws iam attach-role-policy \
  --role-name aws-job-search-web-server-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore

# Create instance profile
aws iam create-instance-profile \
  --instance-profile-name aws-job-search-web-server-profile

# Add role to instance profile
aws iam add-role-to-instance-profile \
  --instance-profile-name aws-job-search-web-server-profile \
  --role-name aws-job-search-web-server-role
```

## EC2 Instance Deployment

```bash
# Create EC2 instance (replace placeholders)
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id ami-042e8287309f5df03 \
  --instance-type t2.micro \
  --key-name YOUR_KEY_NAME \
  --subnet-id $PUBLIC_SUBNET_ID \
  --security-group-ids $WEB_SG_ID \
  --iam-instance-profile Name=aws-job-search-web-server-profile \
  --user-data file://user_data.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=aws-job-search-web-server}]' \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "EC2 instance created: $INSTANCE_ID"

# Create Elastic IP
EIP_ALLOCATION_ID=$(aws ec2 allocate-address \
  --domain vpc \
  --tag-specifications 'ResourceType=elastic-ip,Tags=[{Key=Name,Value=aws-job-search-web-eip}]' \
  --query 'AllocationId' \
  --output text)

echo "Elastic IP created: $EIP_ALLOCATION_ID"

# Wait for instance to be running
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# Associate Elastic IP with EC2 instance
aws ec2 associate-address \
  --instance-id $INSTANCE_ID \
  --allocation-id $EIP_ALLOCATION_ID

# Get public IP
PUBLIC_IP=$(aws ec2 describe-addresses \
  --allocation-ids $EIP_ALLOCATION_ID \
  --query 'Addresses[0].PublicIp' \
  --output text)

echo "Web server is available at: http://$PUBLIC_IP"
```

## RDS Database Deployment (optional)

```bash
# Create DB subnet group with multiple subnets
aws rds create-db-subnet-group \
  --db-subnet-group-name aws-job-search-db-subnet-group \
  --db-subnet-group-description "Subnet group for AWS Job Search DB" \
  --subnet-ids $PRIVATE_SUBNET_ID SECOND_PRIVATE_SUBNET_ID \
  --tags Key=Name,Value=aws-job-search-db-subnet-group

# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier aws-job-search-db \
  --db-instance-class db.t2.micro \
  --engine postgres \
  --engine-version 12.8 \
  --allocated-storage 20 \
  --storage-type gp2 \
  --db-name aws_job_search \
  --master-username aws_job_admin \
  --master-user-password YOUR_DB_PASSWORD \
  --vpc-security-group-ids $DB_SG_ID \
  --db-subnet-group-name aws-job-search-db-subnet-group \
  --no-publicly-accessible \
  --no-multi-az \
  --tags Key=Name,Value=aws-job-search-database

echo "RDS PostgreSQL instance created. This will take several minutes to complete."
```

## Load Balancer Setup (optional)

```bash
# Create target group
TG_ARN=$(aws elbv2 create-target-group \
  --name aws-job-search-target-group \
  --protocol HTTP \
  --port 80 \
  --vpc-id $VPC_ID \
  --health-check-protocol HTTP \
  --health-check-path / \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 2 \
  --matcher HttpCode=200 \
  --tags Key=Name,Value=aws-job-search-target-group \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

echo "Target group created: $TG_ARN"

# Register EC2 instance with target group
aws elbv2 register-targets \
  --target-group-arn $TG_ARN \
  --targets Id=$INSTANCE_ID,Port=80

# Create load balancer
LB_ARN=$(aws elbv2 create-load-balancer \
  --name aws-job-search-alb \
  --subnets $PUBLIC_SUBNET_ID SECOND_PUBLIC_SUBNET_ID \
  --security-groups $WEB_SG_ID \
  --tags Key=Name,Value=aws-job-search-alb \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

echo "Application Load Balancer created: $LB_ARN"

# Create HTTP listener
aws elbv2 create-listener \
  --load-balancer-arn $LB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN

echo "HTTP listener created"

# Wait for load balancer to be active
aws elbv2 wait load-balancer-available --load-balancer-arns $LB_ARN

# Get load balancer DNS name
LB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns $LB_ARN \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

echo "Load balancer is available at: http://$LB_DNS"
```

## Certificate Manager and HTTPS Setup (optional)

```bash
# Request a certificate (replace with your domain)
CERT_ARN=$(aws acm request-certificate \
  --domain-name example.com \
  --validation-method DNS \
  --subject-alternative-names "*.example.com" \
  --query 'CertificateArn' \
  --output text)

echo "Certificate requested: $CERT_ARN"

# Add HTTPS listener (after certificate validation is complete)
aws elbv2 create-listener \
  --load-balancer-arn $LB_ARN \
  --protocol HTTPS \
  --port 443 \
  --ssl-policy ELBSecurityPolicy-2016-08 \
  --certificates CertificateArn=$CERT_ARN \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN

echo "HTTPS listener created"
```

## CloudWatch Monitoring

```bash
# Create CloudWatch alarm for high CPU utilization
aws cloudwatch put-metric-alarm \
  --alarm-name aws-job-search-high-cpu \
  --alarm-description "Alarm when CPU exceeds 80% for 5 minutes" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=InstanceId,Value=$INSTANCE_ID \
  --evaluation-periods 2 \
  --alarm-actions YOUR_SNS_TOPIC_ARN

echo "CloudWatch alarm created for high CPU utilization"
```

## Cleanup Commands

```bash
# Delete resources when no longer needed

# Disassociate EIP
aws ec2 disassociate-address --association-id ASSOCIATION_ID

# Release EIP
aws ec2 release-address --allocation-id $EIP_ALLOCATION_ID

# Terminate EC2 instance
aws ec2 terminate-instances --instance-ids $INSTANCE_ID

# Delete load balancer
aws elbv2 delete-load-balancer --load-balancer-arn $LB_ARN

# Delete target group
aws elbv2 delete-target-group --target-group-arn $TG_ARN

# Delete RDS instance
aws rds delete-db-instance \
  --db-instance-identifier aws-job-search-db \
  --skip-final-snapshot

# Delete DB subnet group
aws rds delete-db-subnet-group --db-subnet-group-name aws-job-search-db-subnet-group

# Delete security groups
aws ec2 delete-security-group --group-id $DB_SG_ID
aws ec2 delete-security-group --group-id $WEB_SG_ID

# Delete route table association
aws ec2 disassociate-route-table --association-id ROUTE_TABLE_ASSOCIATION_ID

# Delete route table
aws ec2 delete-route-table --route-table-id $PUBLIC_RT_ID

# Detach internet gateway
aws ec2 detach-internet-gateway --internet-gateway-id $IGW_ID --vpc-id $VPC_ID

# Delete internet gateway
aws ec2 delete-internet-gateway --internet-gateway-id $IGW_ID

# Delete subnets
aws ec2 delete-subnet --subnet-id $PRIVATE_SUBNET_ID
aws ec2 delete-subnet --subnet-id $PUBLIC_SUBNET_ID

# Delete VPC
aws ec2 delete-vpc --vpc-id $VPC_ID

# Remove role from instance profile
aws iam remove-role-from-instance-profile \
  --instance-profile-name aws-job-search-web-server-profile \
  --role-name aws-job-search-web-server-role

# Delete instance profile
aws iam delete-instance-profile --instance-profile-name aws-job-search-web-server-profile

# Detach policy from role
aws iam detach-role-policy \
  --role-name aws-job-search-web-server-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore

# Delete role
aws iam delete-role --role-name aws-job-search-web-server-role
```

## Shell Script for User Data

This is a template for `user_data.sh` referenced in the EC2 instance creation:

```bash
#!/bin/bash
# Log all output
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "Starting AWS Job Search application setup..."

# Update system packages
apt-get update && apt-get upgrade -y

# Install required packages
apt-get install -y python3 python3-pip python3-dev python3-venv nginx postgresql postgresql-contrib libpq-dev build-essential git

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create application directory
mkdir -p /opt/aws-job-search
cd /opt/aws-job-search

# Create application user
useradd -m -s /bin/bash app_user
chown -R app_user:app_user /opt/aws-job-search

# Set up PostgreSQL database
sudo -u postgres psql -c "CREATE DATABASE aws_job_search;"
sudo -u postgres psql -c "CREATE USER aws_job_admin WITH PASSWORD 'your-secure-password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE aws_job_search TO aws_job_admin;"

# Configure PostgreSQL to allow password authentication
sed -i 's/peer/md5/g' /etc/postgresql/*/main/pg_hba.conf
sed -i 's/ident/md5/g' /etc/postgresql/*/main/pg_hba.conf
systemctl restart postgresql

# Clone application repository (replace with your actual repository)
su - app_user -c "git clone https://github.com/your-username/aws-job-search.git /opt/aws-job-search"

# Set up Python virtual environment
su - app_user -c "cd /opt/aws-job-search && python3 -m venv venv"
su - app_user -c "cd /opt/aws-job-search && source venv/bin/activate && pip install -r deployment/requirements.txt"

# Create .env file
cat > /opt/aws-job-search/.env << EOF
FLASK_APP=run.py
FLASK_ENV=production
SECRET_KEY=$(openssl rand -hex 32)
DATABASE_URL=postgresql://aws_job_admin:your-secure-password@localhost/aws_job_search
EOF

chown app_user:app_user /opt/aws-job-search/.env

# Initialize database
su - app_user -c "cd /opt/aws-job-search && source venv/bin/activate && flask db upgrade"
su - app_user -c "cd /opt/aws-job-search && source venv/bin/activate && python initialize_db.py"

# Set up Gunicorn service
cat > /etc/systemd/system/aws-job-search.service << EOF
[Unit]
Description=AWS Job Search Web Application
After=network.target

[Service]
User=app_user
WorkingDirectory=/opt/aws-job-search
Environment="PATH=/opt/aws-job-search/venv/bin"
EnvironmentFile=/opt/aws-job-search/.env
ExecStart=/opt/aws-job-search/venv/bin/gunicorn --workers 3 --bind 0.0.0.0:8080 "app:create_app()"

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
systemctl enable aws-job-search
systemctl start aws-job-search

# Configure Nginx
cat > /etc/nginx/sites-available/aws-job-search << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the Nginx site
ln -s /etc/nginx/sites-available/aws-job-search /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default  # Remove default site
systemctl restart nginx

echo "AWS Job Search application setup complete!"
```

Remember to replace placeholders like `YOUR_KEY_NAME`, `YOUR_IP_ADDRESS/32`, `YOUR_DB_PASSWORD`, `YOUR_SNS_TOPIC_ARN`, and update the repository URL in the user data script.

For production environments, it's recommended to use Terraform as it provides better state management and easier updates to the infrastructure.