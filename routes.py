from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify, session
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import json
import random

from models import db, User, Job, JobSource, Application, SavedJob, InterviewQuestion, QuestionAnswer, BookmarkedQuestion, Badge, UserBadge, ResumeMatchScore

def load_user(user_id):
    return User.query.get(int(user_id))

def register_routes(app):
    """Register all routes for the application"""
    
    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            email = request.form.get('email')
            password = request.form.get('password')
            remember = True if request.form.get('remember') else False
            
            user = User.query.filter_by(email=email).first()
            
            if not user or not user.check_password(password):
                flash('Please check your login details and try again.')
                return redirect(url_for('login'))
            
            login_user(user, remember=remember)
            return redirect(url_for('dashboard'))
        
        return render_template('login.html')
    
    @app.route('/logout')
    @login_required
    def logout():
        logout_user()
        return redirect(url_for('login'))
    
    @app.route('/register', methods=['GET', 'POST'])
    def register():
        if request.method == 'POST':
            email = request.form.get('email')
            username = request.form.get('username')
            password = request.form.get('password')
            
            user = User.query.filter_by(email=email).first()
            if user:
                flash('Email address already exists')
                return redirect(url_for('register'))
            
            user = User.query.filter_by(username=username).first()
            if user:
                flash('Username already exists')
                return redirect(url_for('register'))
            
            new_user = User(
                email=email,
                username=username,
                first_name=request.form.get('first_name', ''),
                last_name=request.form.get('last_name', '')
            )
            new_user.set_password(password)
            
            db.session.add(new_user)
            db.session.commit()
            
            return redirect(url_for('login'))
        
        return render_template('register.html')
    
    @app.route('/')
    def index():
        return render_template('index.html')
    
    @app.route('/dashboard')
    @login_required
    def dashboard():
        # Get recent applications
        recent_applications = Application.query.filter_by(user_id=current_user.id).order_by(Application.applied_date.desc()).limit(5).all()
        
        # Get application stats
        application_stats = {
            'total': Application.query.filter_by(user_id=current_user.id).count(),
            'active': Application.query.filter_by(user_id=current_user.id, status='applied').count(),
            'interviews': Application.query.filter_by(user_id=current_user.id, status='interview').count(),
            'offers': Application.query.filter_by(user_id=current_user.id, status='offered').count(),
            'rejected': Application.query.filter_by(user_id=current_user.id, status='rejected').count()
        }
        
        # Get recent interview questions attempted
        recent_questions = QuestionAnswer.query.filter_by(user_id=current_user.id).order_by(QuestionAnswer.created_at.desc()).limit(3).all()
        
        # Get user badges
        user_badges = UserBadge.query.filter_by(user_id=current_user.id).all()
        
        # Get recommended jobs based on resume match
        recommended_jobs = []
        if current_user.resume_text:
            job_matches = ResumeMatchScore.query.filter_by(user_id=current_user.id).order_by(ResumeMatchScore.score.desc()).limit(3).all()
            for match in job_matches:
                job = Job.query.get(match.job_id)
                if job:
                    recommended_jobs.append({
                        'job': job,
                        'match_score': match.score
                    })
        
        return render_template(
            'dashboard.html',
            applications=recent_applications,
            stats=application_stats,
            questions=recent_questions,
            badges=user_badges,
            recommended_jobs=recommended_jobs
        )
    
    @app.route('/job-board')
    @login_required
    def job_board():
        return render_template('job_board.html')
    
    @app.route('/api/jobs')
    @login_required
    def search_jobs():
        # Get query parameters for filtering
        query = request.args.get('query', '')
        location = request.args.get('location', '')
        job_type = request.args.get('job_type', '')
        easy_apply = request.args.get('easy_apply') == 'true'
        fresher = request.args.get('fresher') == 'true'
        internship = request.args.get('internship') == 'true'
        aws_service = request.args.get('aws_service', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Start building the query
        jobs_query = Job.query
        
        # Apply filters
        if query:
            jobs_query = jobs_query.filter(
                (Job.title.ilike(f'%{query}%')) | 
                (Job.description.ilike(f'%{query}%')) |
                (Job.company.ilike(f'%{query}%'))
            )
        
        if location:
            jobs_query = jobs_query.filter(Job.location.ilike(f'%{location}%'))
        
        if job_type:
            jobs_query = jobs_query.filter(Job.job_type == job_type)
        
        if easy_apply:
            jobs_query = jobs_query.filter(Job.is_easy_apply == True)
        
        if fresher:
            jobs_query = jobs_query.filter(Job.is_fresher == True)
        
        if internship:
            jobs_query = jobs_query.filter(Job.is_internship == True)
        
        if aws_service:
            # Filter by AWS service
            jobs_query = jobs_query.filter(Job.aws_services.contains([aws_service]))
        
        # Order by posted date, newest first
        jobs_query = jobs_query.order_by(Job.posted_date.desc())
        
        # Paginate results
        paginated_jobs = jobs_query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Format response
        jobs = []
        for job in paginated_jobs.items:
            # Check if user has saved this job
            saved = SavedJob.query.filter_by(user_id=current_user.id, job_id=job.id).first() is not None
            
            # Check if user has applied to this job
            applied = Application.query.filter_by(user_id=current_user.id, job_id=job.id).first() is not None
            
            # Get resume match score if available
            match_score = None
            match = ResumeMatchScore.query.filter_by(user_id=current_user.id, job_id=job.id).first()
            if match:
                match_score = match.score
            
            jobs.append({
                'id': job.id,
                'title': job.title,
                'company': job.company,
                'location': job.location,
                'description': job.description,
                'url': job.url,
                'posted_date': job.posted_date.strftime('%Y-%m-%d'),
                'job_type': job.job_type,
                'salary_range': job.salary_range,
                'is_easy_apply': job.is_easy_apply,
                'is_saved': saved,
                'is_applied': applied,
                'match_score': match_score,
                'aws_services': job.aws_services
            })
        
        return jsonify({
            'jobs': jobs,
            'total': paginated_jobs.total,
            'pages': paginated_jobs.pages,
            'current_page': page
        })
    
    @app.route('/api/jobs/<int:job_id>/save', methods=['POST'])
    @login_required
    def save_job(job_id):
        job = Job.query.get_or_404(job_id)
        
        # Check if already saved
        saved_job = SavedJob.query.filter_by(user_id=current_user.id, job_id=job.id).first()
        
        if saved_job:
            # If already saved, remove it
            db.session.delete(saved_job)
            db.session.commit()
            return jsonify({'message': 'Job removed from saved jobs', 'is_saved': False})
        else:
            # If not saved, save it
            new_saved = SavedJob(
                user_id=current_user.id,
                job_id=job.id
            )
            db.session.add(new_saved)
            db.session.commit()
            return jsonify({'message': 'Job saved successfully', 'is_saved': True})
    
    @app.route('/api/jobs/<int:job_id>/apply', methods=['POST'])
    @login_required
    def auto_apply_job(job_id):
        job = Job.query.get_or_404(job_id)
        
        # Check if already applied
        application = Application.query.filter_by(user_id=current_user.id, job_id=job.id).first()
        
        if application:
            return jsonify({
                'success': False, 
                'message': 'You have already applied to this job'
            }), 400
        
        # Create new application
        new_application = Application(
            user_id=current_user.id,
            job_id=job.id,
            status='applied',
            notes='Auto-applied through AWS Job Track'
        )
        
        db.session.add(new_application)
        db.session.commit()
        
        # This is where you would integrate with job application APIs like LinkedIn Easy Apply
        # For now, we'll just mark it as applied in our database
        
        return jsonify({
            'success': True,
            'message': 'Successfully applied to job',
            'application_id': new_application.id
        })
    
    @app.route('/applications')
    @login_required
    def applications():
        return render_template('applications.html')
    
    @app.route('/api/applications')
    @login_required
    def get_applications():
        # Get query parameters for filtering
        status = request.args.get('status', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Start building the query
        apps_query = Application.query.filter_by(user_id=current_user.id)
        
        # Apply status filter if provided
        if status:
            apps_query = apps_query.filter_by(status=status)
        
        # Order by applied date, newest first
        apps_query = apps_query.order_by(Application.applied_date.desc())
        
        # Paginate results
        paginated_apps = apps_query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Format response
        applications = []
        for app in paginated_apps.items:
            job = Job.query.get(app.job_id)
            
            applications.append({
                'id': app.id,
                'job_id': app.job_id,
                'job_title': job.title if job else 'Unknown Job',
                'company': job.company if job else 'Unknown Company',
                'status': app.status,
                'applied_date': app.applied_date.strftime('%Y-%m-%d'),
                'notes': app.notes,
                'follow_up_date': app.follow_up_date.strftime('%Y-%m-%d') if app.follow_up_date else None
            })
        
        return jsonify({
            'applications': applications,
            'total': paginated_apps.total,
            'pages': paginated_apps.pages,
            'current_page': page
        })
    
    @app.route('/api/applications/<int:app_id>', methods=['PATCH'])
    @login_required
    def update_application(app_id):
        application = Application.query.filter_by(id=app_id, user_id=current_user.id).first_or_404()
        
        data = request.get_json()
        
        if 'status' in data:
            application.status = data['status']
        
        if 'notes' in data:
            application.notes = data['notes']
        
        if 'follow_up_date' in data and data['follow_up_date']:
            application.follow_up_date = datetime.strptime(data['follow_up_date'], '%Y-%m-%d')
        
        db.session.commit()
        
        return jsonify({
            'message': 'Application updated successfully',
            'application': {
                'id': application.id,
                'status': application.status,
                'notes': application.notes,
                'follow_up_date': application.follow_up_date.strftime('%Y-%m-%d') if application.follow_up_date else None
            }
        })
    
    @app.route('/interview-prep')
    @login_required
    def interview_prep():
        return render_template('interview_prep.html')
    
    @app.route('/api/interview-questions')
    @login_required
    def get_interview_questions():
        # Get query parameters for filtering
        field = request.args.get('field', 'aws_general')
        aws_service = request.args.get('aws_service', '')
        difficulty = request.args.get('difficulty', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Start building the query
        questions_query = InterviewQuestion.query
        
        # Apply field filter
        questions_query = questions_query.filter_by(field=field)
        
        # Apply AWS service filter if provided
        if aws_service:
            questions_query = questions_query.filter(InterviewQuestion.aws_service.contains(aws_service))
        
        # Apply difficulty filter if provided
        if difficulty:
            questions_query = questions_query.filter_by(difficulty=difficulty)
        
        # Order pinned questions first, then by id 
        questions_query = questions_query.order_by(InterviewQuestion.is_pinned.desc(), InterviewQuestion.id.asc())
        
        # Paginate results
        paginated_questions = questions_query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Format response
        questions = []
        for q in paginated_questions.items:
            # Check if user has bookmarked this question
            is_bookmarked = BookmarkedQuestion.query.filter_by(
                user_id=current_user.id, 
                question_id=q.id
            ).first() is not None
            
            # Get answer count
            answer_count = QuestionAnswer.query.filter_by(question_id=q.id).count()
            
            questions.append({
                'id': q.id,
                'question': q.question,
                'field': q.field,
                'difficulty': q.difficulty,
                'aws_service': q.aws_service,
                'is_pinned': q.is_pinned,
                'is_bookmarked': is_bookmarked,
                'answer_count': answer_count
            })
        
        return jsonify({
            'questions': questions,
            'total': paginated_questions.total,
            'pages': paginated_questions.pages,
            'current_page': page
        })
    
    @app.route('/api/interview-questions/daily')
    @login_required
    def get_daily_question():
        # Get query parameter for field
        field = request.args.get('field', 'aws_general')
        
        # Try to get a pinned question first
        question = InterviewQuestion.query.filter_by(field=field, is_pinned=True).first()
        
        # If no pinned question, get a random one
        if not question:
            questions = InterviewQuestion.query.filter_by(field=field).all()
            if questions:
                question = random.choice(questions)
            else:
                return jsonify(None)
        
        # Check if user has bookmarked this question
        is_bookmarked = BookmarkedQuestion.query.filter_by(
            user_id=current_user.id, 
            question_id=question.id
        ).first() is not None
        
        # Get answers for this question
        answers_query = QuestionAnswer.query.filter_by(question_id=question.id).order_by(QuestionAnswer.upvotes.desc())
        answers = []
        
        for answer in answers_query.all():
            user = User.query.get(answer.user_id)
            answers.append({
                'id': answer.id,
                'answer': answer.answer,
                'created_at': answer.created_at.isoformat(),
                'upvotes': answer.upvotes,
                'user': {
                    'id': user.id,
                    'username': user.username
                }
            })
        
        return jsonify({
            'id': question.id,
            'question': question.question,
            'field': question.field,
            'difficulty': question.difficulty,
            'aws_service': question.aws_service,
            'is_pinned': question.is_pinned,
            'is_bookmarked': is_bookmarked,
            'answers': answers
        })
    
    @app.route('/api/answers/<int:answer_id>/upvote', methods=['POST'])
    @login_required
    def upvote_answer(answer_id):
        answer = QuestionAnswer.query.get_or_404(answer_id)
        
        # Check if this is the user's own answer
        if answer.user_id == current_user.id:
            return jsonify({'error': 'Cannot upvote your own answer'}), 400
        
        # Increment upvotes
        answer.upvotes += 1
        db.session.commit()
        
        # Check for badge eligibility
        check_badge_eligibility(answer.user_id)
        
        return jsonify({
            'message': 'Answer upvoted successfully',
            'upvotes': answer.upvotes
        })
    
    @app.route('/api/interview-questions/<int:question_id>/bookmark', methods=['POST'])
    @login_required
    def bookmark_question(question_id):
        question = InterviewQuestion.query.get_or_404(question_id)
        
        # Check if already bookmarked
        bookmark = BookmarkedQuestion.query.filter_by(
            user_id=current_user.id,
            question_id=question.id
        ).first()
        
        if bookmark:
            # If already bookmarked, remove it
            db.session.delete(bookmark)
            db.session.commit()
            return jsonify({
                'message': 'Bookmark removed',
                'is_bookmarked': False
            })
        else:
            # If not bookmarked, add it
            new_bookmark = BookmarkedQuestion(
                user_id=current_user.id,
                question_id=question.id
            )
            db.session.add(new_bookmark)
            db.session.commit()
            return jsonify({
                'message': 'Question bookmarked',
                'is_bookmarked': True
            })
    
    @app.route('/api/interview-questions/<int:question_id>/answers', methods=['POST'])
    @login_required
    def add_answer(question_id):
        question = InterviewQuestion.query.get_or_404(question_id)
        
        data = request.get_json()
        answer_text = data.get('answer', '')
        
        if not answer_text:
            return jsonify({'error': 'Answer text is required'}), 400
        
        # Create new answer
        new_answer = QuestionAnswer(
            question_id=question.id,
            user_id=current_user.id,
            answer=answer_text,
            created_at=datetime.utcnow()
        )
        
        db.session.add(new_answer)
        db.session.commit()
        
        # Check for badge eligibility
        check_badge_eligibility(current_user.id)
        
        return jsonify({
            'message': 'Answer added successfully',
            'answer': {
                'id': new_answer.id,
                'answer': new_answer.answer,
                'created_at': new_answer.created_at.isoformat(),
                'upvotes': 0,
                'user': {
                    'id': current_user.id,
                    'username': current_user.username
                }
            }
        })
    
    @app.route('/community')
    @login_required
    def community():
        return render_template('community.html')
    
    @app.route('/api/community/top-contributors')
    def get_top_contributors():
        # Get the top contributors based on answer upvotes
        # This query gets users with the most total upvotes across all their answers
        result = db.session.query(
            User,
            db.func.sum(QuestionAnswer.upvotes).label('total_upvotes'),
            db.func.count(QuestionAnswer.id).label('answer_count')
        ).join(
            QuestionAnswer, 
            User.id == QuestionAnswer.user_id
        ).group_by(
            User.id
        ).order_by(
            db.desc('total_upvotes')
        ).limit(10).all()
        
        # Format the response
        contributors = []
        for user, total_upvotes, answer_count in result:
            # Get badges for this user
            badges = []
            for ub in UserBadge.query.filter_by(user_id=user.id).all():
                badge = Badge.query.get(ub.badge_id)
                badges.append({
                    'id': badge.id,
                    'name': badge.name,
                    'image_url': badge.image_url
                })
            
            contributors.append({
                'id': user.id,
                'username': user.username,
                'total_upvotes': total_upvotes,
                'answer_count': answer_count,
                'badges': badges
            })
        
        return jsonify({
            'contributors': contributors
        })
    
    @app.route('/profile')
    @login_required
    def profile():
        return render_template('profile.html')
    
    @app.route('/api/profile')
    @login_required
    def get_profile():
        # Get user badges
        badges = []
        for ub in UserBadge.query.filter_by(user_id=current_user.id).all():
            badge = Badge.query.get(ub.badge_id)
            badges.append({
                'id': badge.id,
                'name': badge.name,
                'description': badge.description,
                'image_url': badge.image_url,
                'awarded_at': ub.awarded_at.isoformat()
            })
        
        # Get user activity stats
        applications_count = Application.query.filter_by(user_id=current_user.id).count()
        answers_count = QuestionAnswer.query.filter_by(user_id=current_user.id).count()
        saved_jobs_count = SavedJob.query.filter_by(user_id=current_user.id).count()
        bookmarked_questions_count = BookmarkedQuestion.query.filter_by(user_id=current_user.id).count()
        
        # Get total upvotes received
        total_upvotes = db.session.query(db.func.sum(QuestionAnswer.upvotes)).filter(
            QuestionAnswer.user_id == current_user.id
        ).scalar() or 0
        
        return jsonify({
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email,
                'first_name': current_user.first_name,
                'last_name': current_user.last_name,
                'created_at': current_user.created_at.isoformat(),
                'linkedin_profile': current_user.linkedin_profile,
                'has_resume': bool(current_user.resume_text)
            },
            'badges': badges,
            'stats': {
                'applications': applications_count,
                'answers': answers_count,
                'saved_jobs': saved_jobs_count,
                'bookmarked_questions': bookmarked_questions_count,
                'total_upvotes': total_upvotes
            }
        })
    
    @app.route('/api/profile', methods=['PATCH'])
    @login_required
    def update_profile():
        data = request.get_json()
        
        if 'first_name' in data:
            current_user.first_name = data['first_name']
        
        if 'last_name' in data:
            current_user.last_name = data['last_name']
        
        if 'linkedin_profile' in data:
            current_user.linkedin_profile = data['linkedin_profile']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email,
                'first_name': current_user.first_name,
                'last_name': current_user.last_name,
                'linkedin_profile': current_user.linkedin_profile
            }
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return render_template('404.html'), 404
    
    @app.errorhandler(500)
    def server_error(error):
        return render_template('500.html'), 500
    
    # Helper functions
    def check_badge_eligibility(user_id):
        """Check if a user is eligible for any badges and award them if so"""
        
        user = User.query.get(user_id)
        if not user:
            return
        
        # Get user stats
        answers_count = QuestionAnswer.query.filter_by(user_id=user.id).count()
        
        # Get total upvotes received
        total_upvotes = db.session.query(db.func.sum(QuestionAnswer.upvotes)).filter(
            QuestionAnswer.user_id == user.id
        ).scalar() or 0
        
        # Get distinct AWS service categories the user has answered questions in
        service_categories = db.session.query(InterviewQuestion.field).join(
            QuestionAnswer, InterviewQuestion.id == QuestionAnswer.question_id
        ).filter(
            QuestionAnswer.user_id == user.id
        ).distinct().count()
        
        # Check for AWS Solver badge (5+ answers)
        if answers_count >= 5:
            aws_solver_badge = Badge.query.filter_by(name="AWS Solver").first()
            if aws_solver_badge:
                # Check if user already has this badge
                existing_badge = UserBadge.query.filter_by(
                    user_id=user.id,
                    badge_id=aws_solver_badge.id
                ).first()
                
                if not existing_badge:
                    # Award the badge
                    new_badge = UserBadge(
                        user_id=user.id,
                        badge_id=aws_solver_badge.id,
                        awarded_at=datetime.utcnow()
                    )
                    db.session.add(new_badge)
                    db.session.commit()
        
        # Check for AWS Expert badge (10+ upvotes)
        if total_upvotes >= 10:
            aws_expert_badge = Badge.query.filter_by(name="AWS Expert").first()
            if aws_expert_badge:
                # Check if user already has this badge
                existing_badge = UserBadge.query.filter_by(
                    user_id=user.id,
                    badge_id=aws_expert_badge.id
                ).first()
                
                if not existing_badge:
                    # Award the badge
                    new_badge = UserBadge(
                        user_id=user.id,
                        badge_id=aws_expert_badge.id,
                        awarded_at=datetime.utcnow()
                    )
                    db.session.add(new_badge)
                    db.session.commit()
        
        # Check for AWS Guru badge (answers in 5+ service categories)
        if service_categories >= 5:
            aws_guru_badge = Badge.query.filter_by(name="AWS Guru").first()
            if aws_guru_badge:
                # Check if user already has this badge
                existing_badge = UserBadge.query.filter_by(
                    user_id=user.id,
                    badge_id=aws_guru_badge.id
                ).first()
                
                if not existing_badge:
                    # Award the badge
                    new_badge = UserBadge(
                        user_id=user.id,
                        badge_id=aws_guru_badge.id,
                        awarded_at=datetime.utcnow()
                    )
                    db.session.add(new_badge)
                    db.session.commit()
    
    return app