# Amazon RDS PostgreSQL Configuration
# Uncomment this file to use RDS instead of local PostgreSQL

/*
resource "aws_db_subnet_group" "main" {
  name       = "aws-job-search-db-subnet-group"
  subnet_ids = [aws_subnet.private.id, aws_subnet.private_2.id]

  tags = {
    Name = "AWS Job Search DB Subnet Group"
  }
}

resource "aws_db_instance" "main" {
  identifier             = "aws-job-search-db"
  allocated_storage      = 20
  storage_type           = "gp2"
  engine                 = "postgres"
  engine_version         = "12.8"
  instance_class         = "db.t2.micro"
  db_name                = "aws_job_search"
  username               = "aws_job_admin"
  password               = var.db_password
  parameter_group_name   = "default.postgres12"
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  skip_final_snapshot    = true
  multi_az               = false
  publicly_accessible    = false

  tags = {
    Name = "AWS Job Search Database"
  }
}

# Additional private subnet in a different AZ for RDS requirements
resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"  # Different CIDR from primary private subnet
  availability_zone = var.availability_zone_2

  tags = {
    Name = "aws-job-search-private-subnet-2"
  }
}

# Update variables.tf to add:
# variable "availability_zone_2" {
#   description = "Secondary Availability Zone for RDS"
#   type        = string
#   default     = "us-east-1b"  # Different AZ than primary
# }

# When using RDS, update the user_data.sh script to use RDS connection info:
# Replace DATABASE_URL line with:
# DATABASE_URL=postgresql://aws_job_admin:${db_password}@${aws_db_instance.main.endpoint}/aws_job_search
*/