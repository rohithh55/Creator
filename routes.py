from flask import render_template, request, redirect, url_for, flash, jsonify, session
from flask_login import login_user, logout_user, login_required, current_user
from models import User, Job, Application, InterviewQuestion, QuestionAnswer, Badge, UserBadge, SavedJob, ResumeMatchScore
from app import db, login_manager
from services.job_scraper import JobScraperService
from services.auto_apply import AutoApplyService
from services.resume_matcher import ResumeMatcherService
import json

# Initialize services
job_scraper = JobScraperService()
auto_apply = AutoApplyService()
resume_matcher = ResumeMatcherService()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def register_routes(app):
    
    # Authentication routes
    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if current_user.is_authenticated:
            return redirect(url_for('dashboard'))
            
        if request.method == 'POST':
            username = request.form.get('username')
            password = request.form.get('password')
            
            user = User.query.filter_by(username=username).first()
            
            if user and user.check_password(password):
                login_user(user)
                next_page = request.args.get('next')
                return redirect(next_page or url_for('dashboard'))
            else:
                flash('Invalid username or password', 'error')
                
        return render_template('login.html')
    
    @app.route('/logout')
    @login_required
    def logout():
        logout_user()
        return redirect(url_for('login'))
    
    @app.route('/register', methods=['GET', 'POST'])
    def register():
        if current_user.is_authenticated:
            return redirect(url_for('dashboard'))
            
        if request.method == 'POST':
            username = request.form.get('username')
            email = request.form.get('email')
            password = request.form.get('password')
            confirm_password = request.form.get('confirm_password')
            
            if password != confirm_password:
                flash('Passwords do not match', 'error')
                return redirect(url_for('register'))
                
            existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
            if existing_user:
                flash('Username or email already exists', 'error')
                return redirect(url_for('register'))
                
            user = User(username=username, email=email)
            user.set_password(password)
            
            db.session.add(user)
            db.session.commit()
            
            flash('Account created successfully! You can now log in.', 'success')
            return redirect(url_for('login'))
            
        return render_template('register.html')
    
    # Main page routes
    @app.route('/')
    def index():
        if current_user.is_authenticated:
            return redirect(url_for('dashboard'))
        return render_template('index.html')
    
    @app.route('/dashboard')
    @login_required
    def dashboard():
        # Get application stats
        application_stats = {
            'applied': Application.query.filter_by(user_id=current_user.id, status='applied').count(),
            'in_review': Application.query.filter_by(user_id=current_user.id, status='in_review').count(),
            'interview': Application.query.filter_by(user_id=current_user.id, status='interview').count(),
            'rejected': Application.query.filter_by(user_id=current_user.id, status='rejected').count(),
            'offered': Application.query.filter_by(user_id=current_user.id, status='offered').count(),
            'total': Application.query.filter_by(user_id=current_user.id).count()
        }
        
        # Get recent job listings
        recent_jobs = Job.query.order_by(Job.posted_date.desc()).limit(5).all()
        
        # Get user badges
        user_badges = UserBadge.query.filter_by(user_id=current_user.id).all()
        
        # Get upcoming interviews (applications with status 'interview')
        upcoming_interviews = Application.query.filter_by(
            user_id=current_user.id, 
            status='interview'
        ).order_by(Application.follow_up_date).limit(3).all()
        
        return render_template(
            'dashboard.html',
            stats=application_stats,
            recent_jobs=recent_jobs,
            badges=user_badges,
            upcoming_interviews=upcoming_interviews
        )
    
    # Job Board routes
    @app.route('/job-board')
    @login_required
    def job_board():
        return render_template('job_board.html')
    
    @app.route('/api/jobs/search')
    @login_required
    def search_jobs():
        search_term = request.args.get('search', '')
        filter_type = request.args.get('filter', 'all')
        tech_category = request.args.get('category', 'all')
        location = request.args.get('location', '')
        page = int(request.args.get('page', 1))
        page_size = 10
        
        # Build the query
        query = Job.query
        
        # Apply filters
        if search_term:
            query = query.filter(
                (Job.title.ilike(f'%{search_term}%')) |
                (Job.description.ilike(f'%{search_term}%')) |
                (Job.company.ilike(f'%{search_term}%'))
            )
            
        if filter_type == 'freshers':
            query = query.filter_by(is_fresher=True)
        elif filter_type == 'internships':
            query = query.filter_by(is_internship=True)
            
        if tech_category != 'all':
            query = query.filter(Job.aws_services.contains([tech_category]))
            
        if location:
            query = query.filter(Job.location.ilike(f'%{location}%'))
            
        # Calculate pagination
        total_jobs = query.count()
        total_pages = (total_jobs + page_size - 1) // page_size
        
        # Get paginated results
        jobs = query.order_by(Job.posted_date.desc()).offset((page - 1) * page_size).limit(page_size).all()
        
        # Format results for JSON
        job_list = []
        for job in jobs:
            job_dict = {
                'id': job.id,
                'title': job.title,
                'company': job.company,
                'location': job.location,
                'description': job.description,
                'url': job.url,
                'posted_date': job.posted_date.isoformat() if job.posted_date else None,
                'job_type': job.job_type,
                'salary_range': job.salary_range,
                'is_easy_apply': job.is_easy_apply,
                'is_fresher': job.is_fresher,
                'is_internship': job.is_internship,
                'aws_services': job.aws_services
            }
            
            # Add resume match score if available
            if current_user.is_authenticated:
                match_score = ResumeMatchScore.query.filter_by(
                    user_id=current_user.id,
                    job_id=job.id
                ).first()
                
                if match_score:
                    job_dict['match_score'] = match_score.score
                else:
                    # Calculate match score on-demand
                    score = resume_matcher.calculate_match_score(current_user.id, job.id)
                    job_dict['match_score'] = score.score if score else None
                    
            job_list.append(job_dict)
            
        return jsonify({
            'jobs': job_list,
            'total': total_jobs,
            'pages': total_pages,
            'current_page': page
        })
    
    @app.route('/api/jobs/<int:job_id>/save', methods=['POST'])
    @login_required
    def save_job(job_id):
        job = Job.query.get_or_404(job_id)
        
        # Check if already saved
        existing_save = SavedJob.query.filter_by(
            user_id=current_user.id,
            job_id=job_id
        ).first()
        
        if existing_save:
            return jsonify({'message': 'Job already saved'}), 200
            
        # Save the job
        saved_job = SavedJob(user_id=current_user.id, job_id=job_id)
        db.session.add(saved_job)
        db.session.commit()
        
        return jsonify({'message': 'Job saved successfully'}), 201
    
    @app.route('/api/jobs/<int:job_id>/auto-apply', methods=['POST'])
    @login_required
    def auto_apply_job(job_id):
        job = Job.query.get_or_404(job_id)
        
        if not job.is_easy_apply:
            return jsonify({'error': 'This job does not support Easy Apply'}), 400
            
        try:
            # Let the service handle the application
            result = auto_apply.apply_to_job(current_user.id, job_id)
            
            return jsonify({
                'success': True,
                'message': 'Application submitted successfully',
                'application_id': result.id
            }), 201
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    # Applications routes
    @app.route('/applications')
    @login_required
    def applications():
        return render_template('applications.html')
    
    @app.route('/api/applications')
    @login_required
    def get_applications():
        status_filter = request.args.get('status', None)
        
        query = Application.query.filter_by(user_id=current_user.id)
        
        if status_filter and status_filter != 'all':
            query = query.filter_by(status=status_filter)
            
        applications = query.order_by(Application.applied_date.desc()).all()
        
        # Format for JSON response
        application_list = []
        for app in applications:
            job = Job.query.get(app.job_id)
            
            application_list.append({
                'id': app.id,
                'status': app.status,
                'applied_date': app.applied_date.isoformat(),
                'notes': app.notes,
                'follow_up_date': app.follow_up_date.isoformat() if app.follow_up_date else None,
                'job': {
                    'id': job.id,
                    'title': job.title,
                    'company': job.company,
                    'location': job.location,
                    'url': job.url
                }
            })
            
        return jsonify(application_list)
    
    @app.route('/api/applications/<int:app_id>', methods=['PATCH'])
    @login_required
    def update_application(app_id):
        application = Application.query.get_or_404(app_id)
        
        # Check ownership
        if application.user_id != current_user.id:
            return jsonify({'error': 'Not authorized'}), 403
            
        data = request.json
        
        if 'status' in data:
            application.status = data['status']
            
        if 'notes' in data:
            application.notes = data['notes']
            
        if 'follow_up_date' in data:
            application.follow_up_date = data['follow_up_date']
            
        db.session.commit()
        
        return jsonify({'message': 'Application updated successfully'})
    
    # Interview Prep routes
    @app.route('/interview-prep')
    @login_required
    def interview_prep():
        return render_template('interview_prep.html')
    
    @app.route('/api/interview-questions')
    @login_required
    def get_interview_questions():
        field = request.args.get('field', 'aws_general')
        
        questions = InterviewQuestion.query.filter_by(field=field).all()
        
        question_list = []
        for q in questions:
            answers = QuestionAnswer.query.filter_by(question_id=q.id).order_by(QuestionAnswer.upvotes.desc()).all()
            
            # Format answers
            answer_list = []
            for a in answers:
                user = User.query.get(a.user_id)
                answer_list.append({
                    'id': a.id,
                    'answer': a.answer,
                    'upvotes': a.upvotes,
                    'created_at': a.created_at.isoformat(),
                    'user': {
                        'id': user.id,
                        'username': user.username
                    }
                })
            
            # Check if bookmarked by user
            is_bookmarked = BookmarkedQuestion.query.filter_by(
                user_id=current_user.id,
                question_id=q.id
            ).first() is not None
            
            question_list.append({
                'id': q.id,
                'question': q.question,
                'field': q.field,
                'difficulty': q.difficulty,
                'aws_service': q.aws_service,
                'is_pinned': q.is_pinned,
                'is_bookmarked': is_bookmarked,
                'answers': answer_list,
                'answer_count': len(answer_list)
            })
            
        return jsonify(question_list)
    
    @app.route('/api/interview-questions/daily')
    @login_required
    def get_daily_question():
        field = request.args.get('field', 'aws_general')
        
        # Get the pinned question for this field (daily question)
        question = InterviewQuestion.query.filter_by(field=field, is_pinned=True).first()
        
        if not question:
            # If no pinned question, get a random one
            question = InterviewQuestion.query.filter_by(field=field).order_by(db.func.random()).first()
            
        if not question:
            return jsonify(None)
            
        # Get answers
        answers = QuestionAnswer.query.filter_by(question_id=question.id).order_by(QuestionAnswer.upvotes.desc()).all()
        
        # Format answers
        answer_list = []
        for a in answers:
            user = User.query.get(a.user_id)
            answer_list.append({
                'id': a.id,
                'answer': a.answer,
                'upvotes': a.upvotes,
                'created_at': a.created_at.isoformat(),
                'user': {
                    'id': user.id,
                    'username': user.username
                }
            })
        
        # Check if bookmarked by user
        is_bookmarked = BookmarkedQuestion.query.filter_by(
            user_id=current_user.id,
            question_id=question.id
        ).first() is not None
        
        return jsonify({
            'id': question.id,
            'question': question.question,
            'field': question.field,
            'difficulty': question.difficulty,
            'aws_service': question.aws_service,
            'is_pinned': question.is_pinned,
            'is_bookmarked': is_bookmarked,
            'answers': answer_list,
            'answer_count': len(answer_list)
        })
    
    @app.route('/api/answers/<int:answer_id>/upvote', methods=['POST'])
    @login_required
    def upvote_answer(answer_id):
        answer = QuestionAnswer.query.get_or_404(answer_id)
        
        # Increment upvotes
        answer.upvotes += 1
        db.session.commit()
        
        # Check if the answer creator should get a badge
        if answer.upvotes >= 10:
            # Check if user already has the badge
            helpful_badge = Badge.query.filter_by(name="Helpful Answer").first()
            
            if helpful_badge and not UserBadge.query.filter_by(
                user_id=answer.user_id,
                badge_id=helpful_badge.id
            ).first():
                # Award the badge
                user_badge = UserBadge(
                    user_id=answer.user_id,
                    badge_id=helpful_badge.id
                )
                db.session.add(user_badge)
                db.session.commit()
        
        return jsonify({'upvotes': answer.upvotes})
    
    @app.route('/api/interview-questions/<int:question_id>/bookmark', methods=['POST'])
    @login_required
    def bookmark_question(question_id):
        # Check if already bookmarked
        existing_bookmark = BookmarkedQuestion.query.filter_by(
            user_id=current_user.id,
            question_id=question_id
        ).first()
        
        if existing_bookmark:
            return jsonify({'message': 'Question already bookmarked'}), 200
            
        # Create bookmark
        bookmark = BookmarkedQuestion(
            user_id=current_user.id,
            question_id=question_id
        )
        db.session.add(bookmark)
        db.session.commit()
        
        return jsonify({'message': 'Question bookmarked successfully'}), 201
    
    @app.route('/api/interview-questions/<int:question_id>/answers', methods=['POST'])
    @login_required
    def add_answer(question_id):
        InterviewQuestion.query.get_or_404(question_id)  # Verify question exists
        
        data = request.json
        answer_text = data.get('answer')
        
        if not answer_text:
            return jsonify({'error': 'Answer text is required'}), 400
            
        answer = QuestionAnswer(
            question_id=question_id,
            user_id=current_user.id,
            answer=answer_text
        )
        
        db.session.add(answer)
        db.session.commit()
        
        # Check if user should get a badge
        answer_count = QuestionAnswer.query.filter_by(user_id=current_user.id).count()
        
        if answer_count >= 5:
            contributor_badge = Badge.query.filter_by(name="Active Contributor").first()
            
            if contributor_badge and not UserBadge.query.filter_by(
                user_id=current_user.id,
                badge_id=contributor_badge.id
            ).first():
                # Award the badge
                user_badge = UserBadge(
                    user_id=current_user.id,
                    badge_id=contributor_badge.id
                )
                db.session.add(user_badge)
                db.session.commit()
        
        return jsonify({
            'id': answer.id,
            'answer': answer.answer,
            'created_at': answer.created_at.isoformat(),
            'upvotes': 0
        }), 201
    
    # Community routes
    @app.route('/community')
    @login_required
    def community():
        return render_template('community.html')
    
    @app.route('/api/community/top-contributors')
    @login_required
    def get_top_contributors():
        # Query users with most answers and highest upvotes
        users = User.query.all()
        
        contributor_list = []
        for user in users:
            answer_count = QuestionAnswer.query.filter_by(user_id=user.id).count()
            
            if answer_count == 0:
                continue
                
            # Calculate total upvotes
            total_upvotes = db.session.query(db.func.sum(QuestionAnswer.upvotes)).filter(
                QuestionAnswer.user_id == user.id
            ).scalar() or 0
            
            # Get user badges
            badges = [badge.badge for badge in UserBadge.query.filter_by(user_id=user.id).all()]
            
            contributor_list.append({
                'id': user.id,
                'username': user.username,
                'answer_count': answer_count,
                'total_upvotes': total_upvotes,
                'badges': [{
                    'id': badge.id,
                    'name': badge.name,
                    'description': badge.description,
                    'image_url': badge.image_url
                } for badge in badges]
            })
        
        # Sort by total upvotes (descending)
        contributor_list.sort(key=lambda x: x['total_upvotes'], reverse=True)
        
        return jsonify(contributor_list[:10])  # Top 10 contributors
    
    # Profile routes
    @app.route('/profile')
    @login_required
    def profile():
        return render_template('profile.html')
    
    @app.route('/api/profile')
    @login_required
    def get_profile():
        # Get user badges
        badges = [{
            'id': ub.badge.id,
            'name': ub.badge.name,
            'description': ub.badge.description,
            'image_url': ub.badge.image_url,
            'awarded_at': ub.awarded_at.isoformat()
        } for ub in UserBadge.query.filter_by(user_id=current_user.id).all()]
        
        return jsonify({
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'first_name': current_user.first_name,
            'last_name': current_user.last_name,
            'resume_text': current_user.resume_text,
            'resume_skills': current_user.resume_skills,
            'resume_education': current_user.resume_education,
            'resume_experience': current_user.resume_experience,
            'badges': badges
        })
    
    @app.route('/api/profile', methods=['PATCH'])
    @login_required
    def update_profile():
        data = request.json
        
        if 'first_name' in data:
            current_user.first_name = data['first_name']
            
        if 'last_name' in data:
            current_user.last_name = data['last_name']
            
        if 'resume_text' in data:
            current_user.resume_text = data['resume_text']
            
            # Extract skills from resume text
            current_user.resume_skills = resume_matcher.extract_skills_from_text(data['resume_text'])
            
        if 'resume_education' in data:
            current_user.resume_education = data['resume_education']
            
        if 'resume_experience' in data:
            current_user.resume_experience = data['resume_experience']
            
        db.session.commit()
        
        return jsonify({'message': 'Profile updated successfully'})
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return render_template('404.html'), 404
    
    @app.errorhandler(500)
    def server_error(error):
        return render_template('500.html'), 500