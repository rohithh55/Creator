# AWS Job Search Application - Terraform Deployment

This directory contains Terraform configuration files to deploy the AWS Job Search application on AWS EC2.

## Prerequisites

1. [Terraform](https://www.terraform.io/downloads.html) installed (v1.0.0 or newer)
2. AWS CLI configured with appropriate credentials
3. SSH key pair created in AWS

## Deployment Steps

### 1. Configure Variables

Copy the example variables file and customize it:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and set the following required values:
- `key_name`: Your SSH key pair name in AWS
- `db_password`: A secure password for the PostgreSQL database
- `ssh_location`: Your IP address or CIDR block for SSH access

### 2. Initialize Terraform

```bash
terraform init
```

### 3. Preview the Deployment Plan

```bash
terraform plan
```

Review the output to ensure the planned actions meet your expectations.

### 4. Apply the Configuration

```bash
terraform apply
```

Type `yes` when prompted to confirm the deployment.

### 5. Access the Application

After the deployment completes successfully, Terraform will output:
- `web_server_public_dns`: Public DNS name of the EC2 instance
- `web_server_public_ip`: Public IP address of the EC2 instance
- `website_url`: URL to access the web application

You can SSH into the instance using:
```bash
ssh -i /path/to/your-key.pem ubuntu@<web_server_public_ip>
```

### 6. Clean Up Resources

When you're done with the resources, you can destroy them to avoid incurring charges:

```bash
terraform destroy
```

Type `yes` when prompted to confirm the deletion of all resources.

## Advanced Configuration

### Using RDS Instead of Local PostgreSQL

To use Amazon RDS instead of a local PostgreSQL database, uncomment the RDS section in `rds.tf` and update the user data script to use the RDS endpoint.

### Using Elastic Load Balancer

For production deployments, you may want to use an Elastic Load Balancer. Uncomment the ELB section in `main.tf` and update the corresponding security group rules.

### Enabling HTTPS

To enable HTTPS, you need to:
1. Register a domain name
2. Create an SSL certificate using AWS Certificate Manager
3. Configure the load balancer to use HTTPS

For detailed instructions, see the comments in `main.tf`.