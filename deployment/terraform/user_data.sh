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
sudo -u postgres psql -c "CREATE USER aws_job_admin WITH PASSWORD '${db_password}';"
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
DATABASE_URL=postgresql://aws_job_admin:${db_password}@localhost/aws_job_search
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