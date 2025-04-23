from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from datetime import datetime

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resume_text = db.Column(db.Text)
    resume_skills = db.Column(db.JSON)
    resume_education = db.Column(db.JSON)
    resume_experience = db.Column(db.JSON)
    linkedin_profile = db.Column(db.JSON)
    
    # Relationships
    job_sources = db.relationship('JobSource', backref='user', lazy=True)
    applications = db.relationship('Application', backref='user', lazy=True)
    question_answers = db.relationship('QuestionAnswer', backref='user', lazy=True)
    badges = db.relationship('UserBadge', backref='user', lazy=True)
    saved_jobs = db.relationship('SavedJob', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'

class JobSource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    credentials = db.Column(db.JSON)
    last_synced = db.Column(db.DateTime, default=datetime.utcnow)
    active = db.Column(db.Boolean, default=True)
    
    # Relationships
    jobs = db.relationship('Job', backref='source', lazy=True)
    
    def __repr__(self):
        return f'<JobSource {self.name}>'

class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100))
    description = db.Column(db.Text)
    url = db.Column(db.String(255), nullable=False)
    posted_date = db.Column(db.DateTime)
    source_id = db.Column(db.Integer, db.ForeignKey('job_source.id'))
    job_type = db.Column(db.String(50))
    salary_range = db.Column(db.String(100))
    is_easy_apply = db.Column(db.Boolean, default=False)
    is_fresher = db.Column(db.Boolean, default=False)
    is_internship = db.Column(db.Boolean, default=False)
    aws_services = db.Column(db.JSON)  # List of AWS services relevant to this job
    
    # AWS-specific fields
    requires_certification = db.Column(db.Boolean, default=False)
    certification_types = db.Column(db.JSON)  # AWS certification types required
    
    # Relationships
    applications = db.relationship('Application', backref='job', lazy=True)
    saved_by = db.relationship('SavedJob', backref='job', lazy=True)
    resume_match_scores = db.relationship('ResumeMatchScore', backref='job', lazy=True)
    
    def __repr__(self):
        return f'<Job {self.title} at {self.company}>'

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)
    status = db.Column(db.String(20), default='applied')  # applied, in_review, interview, rejected, offered
    applied_date = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)
    follow_up_date = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<Application {self.id} - {self.status}>'

class SavedJob(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)
    saved_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<SavedJob {self.id}>'

class InterviewQuestion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    field = db.Column(db.String(50), nullable=False)  # aws_general, ec2, s3, lambda, etc.
    difficulty = db.Column(db.String(20))  # easy, medium, hard
    is_pinned = db.Column(db.Boolean, default=False)
    aws_service = db.Column(db.String(50))  # Specific AWS service this question relates to
    
    # Relationships
    answers = db.relationship('QuestionAnswer', backref='question', lazy=True)
    bookmarked_by = db.relationship('BookmarkedQuestion', backref='question', lazy=True)
    
    def __repr__(self):
        return f'<Question {self.id}: {self.question[:30]}...>'

class QuestionAnswer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('interview_question.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    answer = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    upvotes = db.Column(db.Integer, default=0)
    
    def __repr__(self):
        return f'<Answer {self.id} by User {self.user_id}>'

class BookmarkedQuestion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('interview_question.id'), nullable=False)
    bookmarked_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<BookmarkedQuestion {self.id}>'

class Badge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(255))
    image_url = db.Column(db.String(255))
    category = db.Column(db.String(50))  # community, interview, application
    requirements = db.Column(db.JSON)
    
    # Relationships
    awarded_to = db.relationship('UserBadge', backref='badge', lazy=True)
    
    def __repr__(self):
        return f'<Badge {self.name}>'

class UserBadge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    badge_id = db.Column(db.Integer, db.ForeignKey('badge.id'), nullable=False)
    awarded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<UserBadge {self.id}>'

class ResumeMatchScore(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)
    score = db.Column(db.Float, nullable=False)  # 0-100
    skills_match = db.Column(db.Float)  # 0-100
    experience_match = db.Column(db.Float)  # 0-100
    education_match = db.Column(db.Float)  # 0-100
    keyword_match = db.Column(db.Float)  # 0-100
    calculated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ResumeMatchScore {self.score}% for User {self.user_id} and Job {self.job_id}>'