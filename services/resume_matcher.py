"""
ResumeMatcherService analyzes user resumes and job descriptions to calculate match scores

This service helps predict the likelihood of getting interviews for AWS cloud positions
by analyzing skills, experience, and keywords.
"""

import logging
import re
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class ResumeMatcherService:
    """Service for calculating resume-job matches"""
    
    def __init__(self):
        # Common AWS skills and keywords to look for
        self.aws_skills = [
            'ec2', 'elastic compute cloud', 's3', 'simple storage service',
            'lambda', 'serverless', 'rds', 'relational database service',
            'dynamodb', 'vpc', 'virtual private cloud', 'iam', 'identity access management',
            'eks', 'kubernetes', 'elastic kubernetes service', 'ecs', 'elastic container service',
            'cloudformation', 'cloudwatch', 'route53', 'cloudfront', 'sqs', 'sns',
            'step functions', 'api gateway', 'aws cli', 'terraform', 'ansible', 'chef', 'puppet',
            'aws certified', 'solutions architect', 'sysops administrator', 'devops engineer',
            'cloud practitioner', 'aws security', 'aws networking', 'aws storage'
        ]
    
    def calculate_match_score(self, user_id, job_id):
        """
        Calculates a match score between a user's resume and a job posting
        
        Args:
            user_id: The ID of the user
            job_id: The ID of the job
            
        Returns:
            A ResumeMatchScore object with the calculated scores
        """
        from models import User, Job, ResumeMatchScore, db
        
        # Get the user and job
        user = User.query.get(user_id)
        job = Job.query.get(job_id)
        
        if not user or not job:
            logger.error(f"User {user_id} or job {job_id} not found")
            return None
            
        # Check if a match score already exists
        existing_score = ResumeMatchScore.query.filter_by(
            user_id=user_id,
            job_id=job_id
        ).first()
        
        if existing_score:
            return existing_score
            
        # Get user resume text
        resume_text = user.resume_text or ""
        
        # Calculate individual match components
        skills_match = self.calculate_skills_match(resume_text, job.description, job.aws_services)
        experience_match = self.calculate_experience_match(user, job)
        education_match = self.calculate_education_match(user, job)
        keyword_match = self.calculate_keyword_match(resume_text, job.description)
        
        # Calculate overall score (weighted average)
        overall_score = (
            skills_match * 0.4 +
            experience_match * 0.3 +
            education_match * 0.15 +
            keyword_match * 0.15
        )
        
        # Create and save the match score
        match_score = ResumeMatchScore(
            user_id=user_id,
            job_id=job_id,
            score=overall_score,
            skills_match=skills_match,
            experience_match=experience_match,
            education_match=education_match,
            keyword_match=keyword_match,
            calculated_at=datetime.utcnow()
        )
        
        db.session.add(match_score)
        db.session.commit()
        
        logger.info(f"Created match score {overall_score}% for user {user_id} and job {job_id}")
        return match_score
    
    def extract_skills_from_text(self, text):
        """
        Extracts skills (especially AWS-related) from text
        
        Args:
            text: The text to extract skills from
            
        Returns:
            A list of skills found in the text
        """
        if not text:
            return []
            
        skills = []
        text = text.lower()
        
        # Extract AWS skills
        for skill in self.aws_skills:
            if skill.lower() in text:
                skills.append(skill)
                
        # Return unique skills
        return list(set(skills))
    
    def calculate_skills_match(self, resume_text, job_description, job_aws_services):
        """
        Calculates a skills match score
        
        Args:
            resume_text: The user's resume text
            job_description: The job description
            job_aws_services: The AWS services required for the job
            
        Returns:
            A score from 0-100 representing the skills match
        """
        if not resume_text or not job_description:
            return 0
            
        # Extract skills from resume
        resume_skills = self.extract_skills_from_text(resume_text)
        
        if not resume_skills:
            return 0
            
        # Count matches
        matches = 0
        total_required = 0
        
        # Match AWS services
        if job_aws_services:
            total_required += len(job_aws_services)
            for service in job_aws_services:
                service_lower = service.lower()
                if any(service_lower in skill.lower() for skill in resume_skills):
                    matches += 1
        
        # Calculate percentage
        if total_required == 0:
            return 50  # Default mid-value if no specific skills required
            
        return min(100, int((matches / total_required) * 100))
    
    def calculate_experience_match(self, user, job):
        """
        Calculates an experience match score
        
        Args:
            user: The user object
            job: The job object
            
        Returns:
            A score from 0-100 representing the experience match
        """
        # In a real implementation, this would analyze the user's experience 
        # against the job requirements in more detail
        return 70  # Default value
    
    def calculate_education_match(self, user, job):
        """
        Calculates an education match score
        
        Args:
            user: The user object
            job: The job object
            
        Returns:
            A score from 0-100 representing the education match
        """
        # In a real implementation, this would analyze the user's education
        # against the job requirements in more detail
        return 65  # Default value
    
    def calculate_keyword_match(self, resume_text, job_description):
        """
        Calculates a keyword match score
        
        Args:
            resume_text: The user's resume text
            job_description: The job description
            
        Returns:
            A score from 0-100 representing the keyword match
        """
        if not resume_text or not job_description:
            return 0
            
        # In a real implementation, this would use more sophisticated NLP techniques
        # to identify key phrases and concepts
        
        # Extract key phrases from job description
        job_words = set(re.findall(r'\b\w+\b', job_description.lower()))
        resume_words = set(re.findall(r'\b\w+\b', resume_text.lower()))
        
        # Filter out common words
        common_words = {'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
                       'to', 'of', 'in', 'on', 'for', 'with', 'by', 'at', 'from'}
        job_words = job_words - common_words
        resume_words = resume_words - common_words
        
        # Count matches
        if not job_words:
            return 50  # Default value
            
        matches = len(job_words.intersection(resume_words))
        
        # Calculate percentage
        return min(100, int((matches / len(job_words)) * 100))