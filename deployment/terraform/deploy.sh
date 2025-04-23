#!/bin/bash
# Deployment script for AWS Job Search application

# Exit on any error
set -e

echo "========================================"
echo "AWS Job Search - Terraform Deployment"
echo "========================================"

# Check for terraform installation
if ! command -v terraform &> /dev/null; then
    echo "Error: Terraform is not installed. Please install Terraform first."
    echo "Visit: https://www.terraform.io/downloads.html"
    exit 1
fi

# Check for AWS CLI configuration
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed. Please install and configure AWS CLI first."
    echo "Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check for terraform.tfvars file
if [ ! -f "terraform.tfvars" ]; then
    echo "terraform.tfvars file not found."
    echo "Creating from example file..."
    
    if [ -f "terraform.tfvars.example" ]; then
        cp terraform.tfvars.example terraform.tfvars
        echo "terraform.tfvars created from example file."
        echo "Please edit terraform.tfvars with your specific values before proceeding."
        exit 0
    else
        echo "Error: terraform.tfvars.example file not found."
        exit 1
    fi
fi

echo "Initializing Terraform..."
terraform init

echo "Validating Terraform configuration..."
terraform validate

echo "Generating deployment plan..."
terraform plan -out=deployment.tfplan

echo ""
echo "Review the plan above. Does it look correct?"
read -p "Proceed with deployment? (y/n): " confirm

if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "Deployment aborted."
    exit 0
fi

echo "Applying Terraform configuration..."
terraform apply deployment.tfplan

echo ""
echo "Deployment completed successfully!"
echo ""
echo "Website URL: $(terraform output -raw website_url)"
echo "SSH Access: ssh -i /path/to/your-key.pem ubuntu@$(terraform output -raw web_server_public_ip)"
echo ""
echo "Note: It may take a few minutes for the server to complete setup."
echo "You can check the setup progress by SSH into the server and running:"
echo "  sudo tail -f /var/log/user-data.log"