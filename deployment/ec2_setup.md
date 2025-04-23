# AWS Job Search Web Application - EC2 Deployment Guide

This guide will walk you through deploying the AWS Job Search web application on an Amazon EC2 instance.

## Prerequisites

1. An AWS account with permissions to create and manage EC2 instances
2. Basic knowledge of Linux and AWS services
3. SSH client installed on your local machine
4. The application code (Python Flask backend, HTML/CSS/JS frontend)

## Step 1: Create an EC2 Instance

1. Sign in to the AWS Management Console
2. Navigate to the EC2 service
3. Click "Launch Instance"
4. Choose an Amazon Machine Image (AMI):
   - Recommended: Amazon Linux 2 or Ubuntu Server 20.04 LTS
5. Choose an Instance Type:
   - Recommended minimum: t2.micro (Free tier eligible) for testing
   - For production: t2.small or larger depending on expected traffic
6. Configure Instance Details:
   - VPC: Choose your default VPC or create a new one
   - Subnet: Choose a public subnet
   - Enable Auto-assign Public IP
7. Add Storage:
   - Default 8GB is sufficient for the application
8. Add Tags:
   - Key: Name, Value: aws-job-search-app
9. Configure Security Group:
   - Create a new security group named "aws-job-search-sg"
   - Add HTTP (port 80) for website access
   - Add HTTPS (port 443) for secure access
   - Add SSH (port 22) for remote access (restrict to your IP)
   - Add Custom TCP (port 8080) for Flask application
10. Review and Launch
11. Create or select an existing key pair for SSH access
12. Launch the instance

## Step 2: Connect to Your EC2 Instance

1. Once the instance is running, note its Public IP Address
2. Connect to your instance via SSH:
   ```bash
   ssh -i /path/to/your-key.pem ec2-user@your-instance-public-ip
   ```
   (Use `ubuntu` instead of `ec2-user` if you selected Ubuntu AMI)

## Step 3: Set Up the Environment

1. Update the system packages:
   ```bash
   # For Amazon Linux
   sudo yum update -y
   
   # For Ubuntu
   sudo apt update && sudo apt upgrade -y
   ```

2. Install Python and required dependencies:
   ```bash
   # For Amazon Linux
   sudo yum install -y python3 python3-pip python3-devel postgresql-devel gcc

   # For Ubuntu
   sudo apt install -y python3 python3-pip python3-dev libpq-dev build-essential
   ```

3. Install Git and clone the repository:
   ```bash
   # For Amazon Linux
   sudo yum install -y git

   # For Ubuntu
   sudo apt install -y git

   # Clone the repository
   git clone https://github.com/your-username/aws-job-search.git
   cd aws-job-search
   ```

4. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

5. Install application dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Step 4: Set Up PostgreSQL Database

1. Install PostgreSQL:
   ```bash
   # For Amazon Linux
   sudo amazon-linux-extras install -y postgresql12
   sudo yum install -y postgresql-server
   sudo postgresql-setup initdb
   sudo systemctl start postgresql
   sudo systemctl enable postgresql

   # For Ubuntu
   sudo apt install -y postgresql postgresql-contrib
   ```

2. Create a database and user:
   ```bash
   sudo -u postgres psql
   ```

   In the PostgreSQL prompt:
   ```sql
   CREATE DATABASE aws_job_search;
   CREATE USER aws_job_admin WITH PASSWORD 'your-secure-password';
   GRANT ALL PRIVILEGES ON DATABASE aws_job_search TO aws_job_admin;
   \q
   ```

3. Update the PostgreSQL configuration to allow password authentication:
   ```bash
   # For Amazon Linux
   sudo nano /var/lib/pgsql/data/pg_hba.conf

   # For Ubuntu
   sudo nano /etc/postgresql/12/main/pg_hba.conf
   ```

   Change `peer` and `ident` methods to `md5` for local connections, then save and exit.

4. Restart PostgreSQL to apply changes:
   ```bash
   sudo systemctl restart postgresql
   ```

## Step 5: Configure the Application

1. Create a `.env` file:
   ```bash
   cd ~/aws-job-search
   nano .env
   ```

2. Add the following environment variables:
   ```
   FLASK_APP=run.py
   FLASK_ENV=production
   SECRET_KEY=your-random-secret-key
   DATABASE_URL=postgresql://aws_job_admin:your-secure-password@localhost/aws_job_search
   ```

3. Initialize the database:
   ```bash
   source venv/bin/activate
   flask db upgrade
   python initialize_db.py
   ```

## Step 6: Set Up Gunicorn and Nginx

1. Install Gunicorn:
   ```bash
   pip install gunicorn
   ```

2. Create a systemd service file for the application:
   ```bash
   sudo nano /etc/systemd/system/aws-job-search.service
   ```

3. Add the following content:
   ```
   [Unit]
   Description=AWS Job Search Web Application
   After=network.target

   [Service]
   User=ec2-user
   WorkingDirectory=/home/ec2-user/aws-job-search
   Environment="PATH=/home/ec2-user/aws-job-search/venv/bin"
   EnvironmentFile=/home/ec2-user/aws-job-search/.env
   ExecStart=/home/ec2-user/aws-job-search/venv/bin/gunicorn --workers 3 --bind 0.0.0.0:8080 "app:create_app()"

   [Install]
   WantedBy=multi-user.target
   ```

   Note: Change `ec2-user` to `ubuntu` if you're using Ubuntu.

4. Enable and start the service:
   ```bash
   sudo systemctl enable aws-job-search
   sudo systemctl start aws-job-search
   ```

5. Install and configure Nginx:
   ```bash
   # For Amazon Linux
   sudo amazon-linux-extras install -y nginx1
   sudo systemctl enable nginx
   sudo systemctl start nginx

   # For Ubuntu
   sudo apt install -y nginx
   sudo systemctl enable nginx
   sudo systemctl start nginx
   ```

6. Configure Nginx as a reverse proxy:
   ```bash
   sudo nano /etc/nginx/conf.d/aws-job-search.conf  # Amazon Linux
   # OR
   sudo nano /etc/nginx/sites-available/aws-job-search  # Ubuntu
   ```

7. Add the following configuration:
   ```
   server {
       listen 80;
       server_name your-instance-public-ip;  # Replace with your domain name or public IP

       location / {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

8. For Ubuntu, create a symlink to enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/aws-job-search /etc/nginx/sites-enabled/
   ```

9. Test the Nginx configuration:
   ```bash
   sudo nginx -t
   ```

10. Restart Nginx:
    ```bash
    sudo systemctl restart nginx
    ```

## Step 7: Configure HTTPS with Let's Encrypt (Optional but Recommended)

1. Install Certbot:
   ```bash
   # For Amazon Linux
   sudo amazon-linux-extras install -y epel
   sudo yum install -y certbot python-certbot-nginx

   # For Ubuntu
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. Obtain an SSL certificate:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

   Follow the prompts to complete the process.

3. Certbot will automatically update your Nginx configuration to use HTTPS.

## Step 8: Update Security Group (if needed)

If you plan to use a domain name and HTTPS, make sure the EC2 security group allows traffic on ports 80 and 443.

## Troubleshooting

### Application Not Starting
- Check application logs: `sudo journalctl -u aws-job-search`
- Verify environment variables: `cat ~/.env`
- Ensure database connectivity: `psql -U aws_job_admin -h localhost -d aws_job_search`

### Nginx Issues
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify Nginx configuration: `sudo nginx -t`
- Check Nginx status: `sudo systemctl status nginx`

### Database Issues
- Check PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-12-main.log` (Ubuntu)
- Verify PostgreSQL is running: `sudo systemctl status postgresql`

## Maintenance

### Updating the Application
```bash
cd ~/aws-job-search
git pull
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart aws-job-search
```

### Database Backups
```bash
pg_dump -U aws_job_admin aws_job_search > backup_$(date +%Y%m%d).sql
```

### Monitoring
Consider setting up AWS CloudWatch for monitoring your EC2 instance.