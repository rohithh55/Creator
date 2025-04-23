# Elastic Load Balancer Configuration
# Uncomment this file to use ELB for production deployments

/*
# Create a security group for the load balancer
resource "aws_security_group" "elb" {
  name        = "aws-job-search-elb-sg"
  description = "Security group for AWS Job Search load balancer"
  vpc_id      = aws_vpc.main.id

  # HTTP access from anywhere
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS access from anywhere
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound internet access
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "aws-job-search-elb-sg"
  }
}

# Create an Application Load Balancer
resource "aws_lb" "main" {
  name               = "aws-job-search-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.elb.id]
  subnets            = [aws_subnet.public.id, aws_subnet.public_2.id]

  enable_deletion_protection = false

  tags = {
    Name = "aws-job-search-alb"
  }
}

# Create a target group for the ALB
resource "aws_lb_target_group" "main" {
  name     = "aws-job-search-target-group"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    Name = "aws-job-search-target-group"
  }
}

# Register the EC2 instance with the target group
resource "aws_lb_target_group_attachment" "main" {
  target_group_arn = aws_lb_target_group.main.arn
  target_id        = aws_instance.web.id
  port             = 80
}

# Create a listener for the ALB
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}

# Optional HTTPS listener with ACM certificate
# Uncomment and configure when you have an ACM certificate
/*
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.acm_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}
*/

# Additional public subnet in a different AZ for ALB requirements
resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.4.0/24"
  map_public_ip_on_launch = true
  availability_zone       = var.availability_zone_2

  tags = {
    Name = "aws-job-search-public-subnet-2"
  }
}

# Associate second public subnet with public route table
resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

# Add to outputs.tf:
# output "load_balancer_dns" {
#   value = aws_lb.main.dns_name
# }
*/