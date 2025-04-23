import { 
  users, type User, type InsertUser,
  jobSources, type JobSource, type InsertJobSource,
  jobs, type Job, type InsertJob,
  applications, type Application, type InsertApplication,
  interviewQuestions, type InterviewQuestion, type InsertInterviewQuestion,
  questionAnswers, type QuestionAnswer, type InsertQuestionAnswer,
  userBadges, type UserBadge, type InsertUserBadge,
  badges, type Badge, type InsertBadge,
  resumeMatchScores, type ResumeMatchScore, type InsertResumeMatchScore,
  JobStatus, BadgeCategories
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLinkedInProfile(userId: number, profileData: any): Promise<User>;
  disconnectLinkedIn(userId: number): Promise<void>;
  updateUserResume(userId: number, resumeData: { 
    resumeText: string; 
    resumeSkills?: any; 
    resumeEducation?: any; 
    resumeExperience?: any;
  }): Promise<User>;

  // Job Source operations
  getJobSource(id: number): Promise<JobSource | undefined>;
  getJobSourcesByUserId(userId: number): Promise<JobSource[]>;
  createJobSource(source: InsertJobSource): Promise<JobSource>;
  updateJobSourceLastSynced(sourceId: number): Promise<JobSource>;
  deleteJobSource(sourceId: number): Promise<void>;

  // Job operations
  getJob(id: number): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  getJobsByFilter(filter: { isFresher?: boolean; isInternship?: boolean }): Promise<Job[]>;
  searchJobs(filter: Record<string, any>, page: number, pageSize: number): Promise<{ jobs: Job[]; total: number }>;
  createJob(job: InsertJob): Promise<Job>;
  saveJob(userId: number, jobId: number): Promise<void>;
  getSavedJobs(userId: number): Promise<Job[]>;

  // Application operations
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByUserId(userId: number): Promise<(Application & { job: Job })[]>;
  getApplicationsByStatus(userId: number, status: string): Promise<(Application & { job: Job })[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, data: { status?: string; notes?: string }): Promise<Application>;
  getApplicationStats(userId: number): Promise<{ applied: number; inReview: number; interview: number; rejected: number; offered: number; total: number }>;

  // Interview Question operations
  getInterviewQuestion(id: number): Promise<InterviewQuestion | undefined>;
  getInterviewQuestionsByField(field: string): Promise<(InterviewQuestion & { answers: QuestionAnswer[] })[]>;
  getPopularInterviewQuestions(field: string): Promise<(InterviewQuestion & { answers: QuestionAnswer[] })[]>;
  getBookmarkedInterviewQuestions(userId: number, field: string): Promise<(InterviewQuestion & { answers: QuestionAnswer[] })[]>;
  getDailyInterviewQuestion(field: string): Promise<(InterviewQuestion & { answers: QuestionAnswer[]; answerCount: number }) | undefined>;
  bookmarkInterviewQuestion(userId: number, questionId: number): Promise<void>;
  getAllInterviewQuestions(): Promise<InterviewQuestion[]>;
  getQuestionAnswersByUser(userId: number): Promise<QuestionAnswer[]>;
  getInterviewQuestionsByService(service: string): Promise<InterviewQuestion[]>;

  // Question Answer operations
  getQuestionAnswer(id: number): Promise<QuestionAnswer | undefined>;
  getAnswersByQuestionId(questionId: number): Promise<QuestionAnswer[]>;
  createQuestionAnswer(answer: InsertQuestionAnswer): Promise<QuestionAnswer>;
  upvoteQuestionAnswer(answerId: number): Promise<QuestionAnswer>;
  getRecentAnswers(): Promise<(QuestionAnswer & { user: User; question: { id: number; question: string; field: string } })[]>;

  // Badge operations
  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]>;
  getUserInterviewBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(userId: number, badgeId: number): Promise<UserBadge>;
  checkAndAwardBadges(userId: number): Promise<void>;

  // Community operations
  getTopContributors(): Promise<(User & { answerCount: number; totalUpvotes: number; badges: Badge[] })[]>;

  // Resume Match Score operations
  getResumeMatchScore(userId: number, jobId: number): Promise<ResumeMatchScore | undefined>;
  calculateResumeMatch(userId: number, jobId: number): Promise<ResumeMatchScore>;
  getJobsWithMatchScore(userId: number, filter: Record<string, any>, page: number, pageSize: number): Promise<{ 
    jobs: (Job & { matchScore?: number })[];
    total: number;
  }>;
}

// In-memory implementation of the storage interface
// Resume matcher helper functions
function extractSkillsFromText(text: string): string[] {
  // In a real implementation, this would use NLP or a predefined skill dictionary
  // For this demo, we'll extract common tech skills using basic pattern matching
  const skillKeywords = [
    'javascript', 'typescript', 'react', 'angular', 'vue', 'node', 'express',
    'python', 'django', 'flask', 'java', 'spring', 'c#', '.net', 'php', 'laravel',
    'ruby', 'rails', 'go', 'rust', 'html', 'css', 'sass', 'less', 'sql', 'nosql',
    'mongodb', 'postgresql', 'mysql', 'oracle', 'redis', 'firebase', 'aws', 'azure',
    'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'gitlab', 'github',
    'ci/cd', 'rest', 'graphql', 'websocket', 'redux', 'jquery', 'bootstrap',
    'tailwind', 'material-ui', 'webpack', 'babel', 'eslint', 'jest', 'mocha',
    'cypress', 'selenium', 'agile', 'scrum', 'kanban', 'jira', 'confluence',
    'git', 'svn', 'linux', 'windows', 'macos', 'mobile', 'responsive', 'pwa',
    'spa', 'ssr', 'seo', 'accessibility', 'i18n', 'l10n', 'ux', 'ui', 'figma',
    'sketch', 'photoshop', 'illustrator', 'analytics', 'marketing', 'sales',
    'crm', 'erp', 'saas', 'paas', 'iaas', 'security', 'authentication', 'authorization',
    'oauth', 'jwt', 'encryption', 'ssl', 'tls', 'https', 'sockets', 'apis',
    'microservices', 'monolith', 'serverless', 'lambda', 'ec2', 's3', 'rds', 'iam',
    'vpc', 'eks', 'devops', 'database', 'frontend', 'backend', 'fullstack'
  ];
  
  const textLower = text.toLowerCase();
  return skillKeywords.filter(skill => textLower.includes(skill));
}

function calculateSkillMatch(resumeSkills: string[], jobSkills: string[]): number {
  if (resumeSkills.length === 0 || jobSkills.length === 0) return 0;
  
  // Count how many job skills are found in the resume
  const matchedSkills = jobSkills.filter(skill => 
    resumeSkills.some(resumeSkill => resumeSkill.includes(skill) || skill.includes(resumeSkill))
  );
  
  return Math.round((matchedSkills.length / jobSkills.length) * 100);
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobSources: Map<number, JobSource>;
  private jobs: Map<number, Job>;
  private applications: Map<number, Application>;
  private interviewQuestions: Map<number, InterviewQuestion>;
  private questionAnswers: Map<number, QuestionAnswer>;
  private userBadges: Map<number, UserBadge>;
  private badges: Map<number, Badge>;
  private resumeMatchScores: Map<string, ResumeMatchScore>; // `${userId}-${jobId}` -> ResumeMatchScore
  private savedJobs: Map<number, Set<number>>; // userId -> Set of jobIds
  private bookmarkedQuestions: Map<number, Set<number>>; // userId -> Set of questionIds
  
  private userId: number = 1;
  private jobSourceId: number = 1;
  private jobId: number = 1;
  private applicationId: number = 1;
  private interviewQuestionId: number = 1;
  private questionAnswerId: number = 1;
  private userBadgeId: number = 1;
  private badgeId: number = 1;

  constructor() {
    this.users = new Map();
    this.jobSources = new Map();
    this.jobs = new Map();
    this.applications = new Map();
    this.interviewQuestions = new Map();
    this.questionAnswers = new Map();
    this.userBadges = new Map();
    this.badges = new Map();
    this.resumeMatchScores = new Map();
    this.savedJobs = new Map();
    this.bookmarkedQuestions = new Map();
    
    // Initialize with some demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create a demo user
    this.createUser({
      username: "demo_user",
      password: "password",
      preferredField: "frontend"
    });

    // Create badges
    this.createBadge({
      name: "7-Day Streak",
      description: "Answered questions for 7 consecutive days",
      icon: "fire",
      requiredScore: 7,
      category: BadgeCategories.STREAK
    });

    this.createBadge({
      name: "Top Contributor",
      description: "Provided valuable answers that received many upvotes",
      icon: "star",
      requiredScore: 10,
      category: BadgeCategories.CONTRIBUTION
    });

    this.createBadge({
      name: "Problem Solver",
      description: "Answered complex technical questions correctly",
      icon: "award",
      requiredScore: 5,
      category: BadgeCategories.PROBLEM_SOLVING
    });

    // Create interview questions
    this.createInterviewQuestion({
      question: "What is the difference between localStorage and sessionStorage?",
      field: "frontend",
      difficulty: "medium",
      isPinned: true
    });

    this.createInterviewQuestion({
      question: "Explain how promises work in JavaScript.",
      field: "frontend",
      difficulty: "hard",
      isPinned: false
    });

    this.createInterviewQuestion({
      question: "What are React hooks and how do they improve component code?",
      field: "frontend",
      difficulty: "medium",
      isPinned: false
    });

    this.createInterviewQuestion({
      question: "Explain the concept of database normalization.",
      field: "backend",
      difficulty: "medium",
      isPinned: true
    });

    this.createInterviewQuestion({
      question: "What is the difference between REST and GraphQL APIs?",
      field: "fullstack",
      difficulty: "medium",
      isPinned: false
    });

    // Create job sources
    this.createJobSource({
      userId: 1,
      url: "https://linkedin.com/jobs",
      name: "LinkedIn"
    });

    this.createJobSource({
      userId: 1,
      url: "https://indeed.com",
      name: "Indeed"
    });

    this.createJobSource({
      userId: 1,
      url: "https://glassdoor.com",
      name: "Glassdoor"
    });

    // Create jobs
    this.createJob({
      title: "Software Engineer (Entry Level)",
      company: "Google",
      location: "Bangalore, India (Remote)",
      jobType: "Full-time",
      description: "Exciting opportunity for freshers to join our engineering team. Looking for candidates with strong CS fundamentals and problem-solving skills. No experience required.",
      postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      url: "https://careers.google.com",
      sourceId: 1,
      isEasyApply: true,
      isFresher: true,
      isInternship: false
    });

    this.createJob({
      title: "Frontend Developer Intern",
      company: "Microsoft",
      location: "Hyderabad, India",
      jobType: "Internship (6 months)",
      description: "Join our frontend team to develop web experiences. We're looking for students or recent graduates with React experience. Perfect for freshers.",
      postedDate: new Date(),
      url: "https://careers.microsoft.com",
      sourceId: 1,
      isEasyApply: false,
      isFresher: true,
      isInternship: true
    });

    this.createJob({
      title: "Junior Data Analyst",
      company: "Amazon",
      location: "Mumbai, India",
      jobType: "Full-time",
      description: "Looking for entry-level data analysts with SQL knowledge and basic statistics understanding. Great opportunity for freshers with analytics interest.",
      postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      url: "https://amazon.jobs",
      sourceId: 2,
      isEasyApply: true,
      isFresher: true,
      isInternship: false
    });

    // Create sample applications
    this.createApplication({
      userId: 1,
      jobId: 1,
      status: JobStatus.APPLIED,
      appliedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      notes: "Applied through LinkedIn Easy Apply"
    });

    this.createApplication({
      userId: 1,
      jobId: 3,
      status: JobStatus.IN_REVIEW,
      appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      notes: "Recruiter viewed my profile"
    });
  }

  private createBadge(badge: Omit<InsertBadge, "id">): Badge {
    const newBadge: Badge = {
      ...badge,
      id: this.badgeId++
    };
    this.badges.set(newBadge.id, newBadge);
    return newBadge;
  }

  private createInterviewQuestion(question: Omit<InsertInterviewQuestion, "id">): InterviewQuestion {
    const newQuestion: InterviewQuestion = {
      ...question,
      id: this.interviewQuestionId++
    };
    this.interviewQuestions.set(newQuestion.id, newQuestion);
    return newQuestion;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: this.userId++,
      linkedinConnected: false,
      linkedinToken: undefined,
      linkedinProfileData: undefined
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUserLinkedInProfile(userId: number, profileData: any): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser: User = {
      ...user,
      linkedinConnected: true,
      linkedinToken: "sample_token", // In a real app, this would be the actual token
      linkedinProfileData: profileData
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async disconnectLinkedIn(userId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser: User = {
      ...user,
      linkedinConnected: false,
      linkedinToken: undefined,
      linkedinProfileData: undefined
    };
    
    this.users.set(userId, updatedUser);
  }

  async updateUserResume(userId: number, resumeData: { 
    resumeText: string; 
    resumeSkills?: any; 
    resumeEducation?: any; 
    resumeExperience?: any;
  }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser: User = {
      ...user,
      resumeText: resumeData.resumeText,
      resumeSkills: resumeData.resumeSkills || null,
      resumeEducation: resumeData.resumeEducation || null,
      resumeExperience: resumeData.resumeExperience || null,
      resumeUpdatedAt: new Date()
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Job Source operations
  async getJobSource(id: number): Promise<JobSource | undefined> {
    return this.jobSources.get(id);
  }

  async getJobSourcesByUserId(userId: number): Promise<JobSource[]> {
    return Array.from(this.jobSources.values()).filter(
      (source) => source.userId === userId
    );
  }

  async createJobSource(source: InsertJobSource): Promise<JobSource> {
    const newSource: JobSource = {
      ...source,
      id: this.jobSourceId++,
      lastSynced: undefined
    };
    this.jobSources.set(newSource.id, newSource);
    return newSource;
  }

  async updateJobSourceLastSynced(sourceId: number): Promise<JobSource> {
    const source = await this.getJobSource(sourceId);
    if (!source) throw new Error("Job source not found");
    
    const updatedSource: JobSource = {
      ...source,
      lastSynced: new Date()
    };
    
    this.jobSources.set(sourceId, updatedSource);
    return updatedSource;
  }

  async deleteJobSource(sourceId: number): Promise<void> {
    this.jobSources.delete(sourceId);
    
    // Also delete all jobs associated with this source
    const jobsToDelete = Array.from(this.jobs.values()).filter(
      (job) => job.sourceId === sourceId
    );
    
    for (const job of jobsToDelete) {
      this.jobs.delete(job.id);
    }
  }

  // Job operations
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }

  async getJobsByFilter(filter: { isFresher?: boolean; isInternship?: boolean }): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter((job) => {
      if (filter.isFresher !== undefined && job.isFresher !== filter.isFresher) return false;
      if (filter.isInternship !== undefined && job.isInternship !== filter.isInternship) return false;
      return true;
    });
  }

  async searchJobs(
    filter: Record<string, any>,
    page: number,
    pageSize: number
  ): Promise<{ jobs: Job[]; total: number }> {
    let filteredJobs = Array.from(this.jobs.values());
    
    // Apply filters
    if (filter.isFresher !== undefined) {
      filteredJobs = filteredJobs.filter((job) => job.isFresher === filter.isFresher);
    }
    
    if (filter.isInternship !== undefined) {
      filteredJobs = filteredJobs.filter((job) => job.isInternship === filter.isInternship);
    }
    
    // Tech category filter
    if (filter.techCategory) {
      const techCategoryLower = filter.techCategory.toLowerCase();
      filteredJobs = filteredJobs.filter((job) => {
        const titleLower = job.title.toLowerCase();
        const descriptionLower = job.description.toLowerCase();
        
        switch (techCategoryLower) {
          case 'python':
            return titleLower.includes('python') || descriptionLower.includes('python');
          case 'aws':
            return (
              // General AWS terms
              titleLower.includes('aws') || 
              descriptionLower.includes('aws') || 
              titleLower.includes('amazon web services') || 
              descriptionLower.includes('amazon web services') ||
              
              // Specific AWS services
              titleLower.includes('ec2') || 
              descriptionLower.includes('ec2') ||
              titleLower.includes('s3') || 
              descriptionLower.includes('s3') ||
              titleLower.includes('rds') || 
              descriptionLower.includes('rds') ||
              titleLower.includes('iam') || 
              descriptionLower.includes('iam') ||
              titleLower.includes('vpc') || 
              descriptionLower.includes('vpc') ||
              titleLower.includes('eks') || 
              descriptionLower.includes('eks') ||
              titleLower.includes('lambda') || 
              descriptionLower.includes('lambda') ||
              titleLower.includes('cloudformation') || 
              descriptionLower.includes('cloudformation') ||
              titleLower.includes('dynamodb') || 
              descriptionLower.includes('dynamodb')
            );
          case 'kubernetes':
            return titleLower.includes('kubernetes') || 
                   descriptionLower.includes('kubernetes') || 
                   titleLower.includes('k8s') || 
                   descriptionLower.includes('k8s') ||
                   titleLower.includes('eks') || 
                   descriptionLower.includes('eks');
          case 'terraform':
            return titleLower.includes('terraform') || 
                   descriptionLower.includes('terraform') || 
                   titleLower.includes('iac') || 
                   descriptionLower.includes('infrastructure as code') ||
                   titleLower.includes('hashicorp') || 
                   descriptionLower.includes('hashicorp');
          case 'devops':
            return titleLower.includes('devops') || 
                   descriptionLower.includes('devops') || 
                   titleLower.includes('ci/cd') || 
                   descriptionLower.includes('ci/cd') ||
                   titleLower.includes('jenkins') || 
                   descriptionLower.includes('jenkins') ||
                   titleLower.includes('gitlab') || 
                   descriptionLower.includes('gitlab') ||
                   titleLower.includes('github actions') || 
                   descriptionLower.includes('github actions');
          default:
            return false;
        }
      });
    }
    
    if (filter.title) {
      const titleLower = filter.title.toLowerCase();
      filteredJobs = filteredJobs.filter((job) => 
        job.title.toLowerCase().includes(titleLower) || 
        job.company.toLowerCase().includes(titleLower) ||
        job.description.toLowerCase().includes(titleLower)
      );
    }
    
    if (filter.location) {
      const locationLower = filter.location.toLowerCase();
      filteredJobs = filteredJobs.filter((job) => 
        job.location.toLowerCase().includes(locationLower)
      );
    }
    
    // Sort by posted date (newest first)
    filteredJobs.sort((a, b) => 
      new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
    );
    
    // Paginate
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const paginatedJobs = filteredJobs.slice(startIdx, endIdx);
    
    return {
      jobs: paginatedJobs,
      total: filteredJobs.length
    };
  }

  async createJob(job: InsertJob): Promise<Job> {
    const newJob: Job = {
      ...job,
      id: this.jobId++
    };
    this.jobs.set(newJob.id, newJob);
    return newJob;
  }

  async saveJob(userId: number, jobId: number): Promise<void> {
    if (!this.savedJobs.has(userId)) {
      this.savedJobs.set(userId, new Set());
    }
    
    this.savedJobs.get(userId)!.add(jobId);
  }

  async getSavedJobs(userId: number): Promise<Job[]> {
    const savedJobIds = this.savedJobs.get(userId);
    if (!savedJobIds || savedJobIds.size === 0) return [];
    
    return Array.from(this.jobs.values()).filter((job) => 
      savedJobIds.has(job.id)
    );
  }

  // Application operations
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async getApplicationsByUserId(userId: number): Promise<(Application & { job: Job })[]> {
    const applications = Array.from(this.applications.values()).filter(
      (application) => application.userId === userId
    );
    
    return applications.map((application) => {
      const job = this.jobs.get(application.jobId)!;
      return { ...application, job };
    });
  }

  async getApplicationsByStatus(userId: number, status: string): Promise<(Application & { job: Job })[]> {
    const applications = Array.from(this.applications.values()).filter(
      (application) => application.userId === userId && application.status === status
    );
    
    return applications.map((application) => {
      const job = this.jobs.get(application.jobId)!;
      return { ...application, job };
    });
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const newApplication: Application = {
      ...application,
      id: this.applicationId++
    };
    this.applications.set(newApplication.id, newApplication);
    return newApplication;
  }

  async updateApplication(id: number, data: { status?: string; notes?: string }): Promise<Application> {
    const application = await this.getApplication(id);
    if (!application) throw new Error("Application not found");
    
    const updatedApplication: Application = {
      ...application,
      ...data
    };
    
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  async getApplicationStats(userId: number): Promise<{ applied: number; inReview: number; interview: number; rejected: number; offered: number; total: number }> {
    const applications = Array.from(this.applications.values()).filter(
      (application) => application.userId === userId
    );
    
    const stats = {
      applied: 0,
      inReview: 0,
      interview: 0,
      rejected: 0,
      offered: 0,
      total: applications.length
    };
    
    applications.forEach((application) => {
      switch (application.status) {
        case JobStatus.APPLIED:
          stats.applied++;
          break;
        case JobStatus.IN_REVIEW:
          stats.inReview++;
          break;
        case JobStatus.INTERVIEW:
          stats.interview++;
          break;
        case JobStatus.REJECTED:
          stats.rejected++;
          break;
        case JobStatus.OFFERED:
          stats.offered++;
          break;
      }
    });
    
    return stats;
  }

  // Interview Question operations
  async getInterviewQuestion(id: number): Promise<InterviewQuestion | undefined> {
    return this.interviewQuestions.get(id);
  }

  async getInterviewQuestionsByField(field: string): Promise<(InterviewQuestion & { answers: QuestionAnswer[] })[]> {
    const questions = Array.from(this.interviewQuestions.values()).filter(
      (question) => question.field === field
    );
    
    return questions.map((question) => {
      const answers = Array.from(this.questionAnswers.values()).filter(
        (answer) => answer.questionId === question.id
      );
      return { ...question, answers };
    });
  }

  async getPopularInterviewQuestions(field: string): Promise<(InterviewQuestion & { answers: QuestionAnswer[] })[]> {
    const questions = await this.getInterviewQuestionsByField(field);
    
    // Sort by number of answers
    return questions.sort((a, b) => b.answers.length - a.answers.length);
  }

  async getBookmarkedInterviewQuestions(userId: number, field: string): Promise<(InterviewQuestion & { answers: QuestionAnswer[] })[]> {
    const bookmarkedIds = this.bookmarkedQuestions.get(userId);
    if (!bookmarkedIds || bookmarkedIds.size === 0) return [];
    
    const questions = Array.from(this.interviewQuestions.values()).filter(
      (question) => bookmarkedIds.has(question.id) && question.field === field
    );
    
    return questions.map((question) => {
      const answers = Array.from(this.questionAnswers.values()).filter(
        (answer) => answer.questionId === question.id
      );
      return { ...question, answers };
    });
  }

  async getDailyInterviewQuestion(field: string): Promise<(InterviewQuestion & { answers: QuestionAnswer[]; answerCount: number }) | undefined> {
    // For demo, just return the first pinned question for the field
    const question = Array.from(this.interviewQuestions.values()).find(
      (question) => question.field === field && question.isPinned
    );
    
    if (!question) return undefined;
    
    const answers = Array.from(this.questionAnswers.values()).filter(
      (answer) => answer.questionId === question.id
    );
    
    return { ...question, answers, answerCount: answers.length };
  }

  async bookmarkInterviewQuestion(userId: number, questionId: number): Promise<void> {
    if (!this.bookmarkedQuestions.has(userId)) {
      this.bookmarkedQuestions.set(userId, new Set());
    }
    
    this.bookmarkedQuestions.get(userId)!.add(questionId);
  }

  // Question Answer operations
  async getQuestionAnswer(id: number): Promise<QuestionAnswer | undefined> {
    return this.questionAnswers.get(id);
  }

  async getAnswersByQuestionId(questionId: number): Promise<QuestionAnswer[]> {
    return Array.from(this.questionAnswers.values()).filter(
      (answer) => answer.questionId === questionId
    );
  }

  async createQuestionAnswer(answer: InsertQuestionAnswer): Promise<QuestionAnswer> {
    const newAnswer: QuestionAnswer = {
      ...answer,
      id: this.questionAnswerId++,
      upvotes: 0
    };
    this.questionAnswers.set(newAnswer.id, newAnswer);
    return newAnswer;
  }

  async upvoteQuestionAnswer(answerId: number): Promise<QuestionAnswer> {
    const answer = await this.getQuestionAnswer(answerId);
    if (!answer) throw new Error("Answer not found");
    
    const updatedAnswer: QuestionAnswer = {
      ...answer,
      upvotes: answer.upvotes + 1
    };
    
    this.questionAnswers.set(answerId, updatedAnswer);
    return updatedAnswer;
  }

  async getRecentAnswers(): Promise<(QuestionAnswer & { user: User; question: { id: number; question: string; field: string } })[]> {
    const answers = Array.from(this.questionAnswers.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    return answers.map((answer) => {
      const user = this.users.get(answer.userId)!;
      const question = this.interviewQuestions.get(answer.questionId)!;
      
      return {
        ...answer,
        user,
        question: {
          id: question.id,
          question: question.question,
          field: question.field
        }
      };
    });
  }

  // Badge operations
  async getAllBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }

  async getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]> {
    const userBadges = Array.from(this.userBadges.values()).filter(
      (userBadge) => userBadge.userId === userId
    );
    
    return userBadges.map((userBadge) => {
      const badge = this.badges.get(userBadge.badgeId)!;
      return { ...userBadge, badge };
    });
  }

  async getUserInterviewBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]> {
    const userBadges = await this.getUserBadges(userId);
    
    // Filter badges related to interview questions (streak, contribution, problem_solving)
    return userBadges;
  }

  async awardBadge(userId: number, badgeId: number): Promise<UserBadge> {
    // Check if user already has this badge
    const existingBadge = Array.from(this.userBadges.values()).find(
      (userBadge) => userBadge.userId === userId && userBadge.badgeId === badgeId
    );
    
    if (existingBadge) return existingBadge;
    
    // Award new badge
    const newUserBadge: UserBadge = {
      id: this.userBadgeId++,
      userId,
      badgeId,
      awardedDate: new Date()
    };
    
    this.userBadges.set(newUserBadge.id, newUserBadge);
    return newUserBadge;
  }

  async checkAndAwardBadges(userId: number): Promise<void> {
    // Get user answers
    const userAnswers = Array.from(this.questionAnswers.values()).filter(
      (answer) => answer.userId === userId
    );
    
    // Get user upvotes total
    const totalUpvotes = userAnswers.reduce((sum, answer) => sum + answer.upvotes, 0);
    
    // Check for Top Contributor badge (10+ upvotes)
    if (totalUpvotes >= 10) {
      const contributorBadge = Array.from(this.badges.values()).find(
        (badge) => badge.category === BadgeCategories.CONTRIBUTION
      );
      
      if (contributorBadge) {
        await this.awardBadge(userId, contributorBadge.id);
      }
    }
    
    // Check for 7-Day Streak (implemented as 7+ answers for demo)
    if (userAnswers.length >= 7) {
      const streakBadge = Array.from(this.badges.values()).find(
        (badge) => badge.category === BadgeCategories.STREAK
      );
      
      if (streakBadge) {
        await this.awardBadge(userId, streakBadge.id);
      }
    }
    
    // Check for Problem Solver (implemented as 5+ answers with upvotes for demo)
    const answersWithUpvotes = userAnswers.filter((answer) => answer.upvotes > 0);
    if (answersWithUpvotes.length >= 5) {
      const solverBadge = Array.from(this.badges.values()).find(
        (badge) => badge.category === BadgeCategories.PROBLEM_SOLVING
      );
      
      if (solverBadge) {
        await this.awardBadge(userId, solverBadge.id);
      }
    }
  }

  // Community operations
  async getTopContributors(): Promise<(User & { answerCount: number; totalUpvotes: number; badges: Badge[] })[]> {
    const usersWithContributions = new Map<number, { answerCount: number; totalUpvotes: number }>();
    
    // Count answers and upvotes for each user
    Array.from(this.questionAnswers.values()).forEach((answer) => {
      if (!usersWithContributions.has(answer.userId)) {
        usersWithContributions.set(answer.userId, { answerCount: 0, totalUpvotes: 0 });
      }
      
      const stats = usersWithContributions.get(answer.userId)!;
      stats.answerCount++;
      stats.totalUpvotes += answer.upvotes;
    });
    
    // Filter users with at least one contribution and add badge info
    const contributors = Array.from(usersWithContributions.entries())
      .filter(([_, stats]) => stats.answerCount > 0)
      .map(([userId, stats]) => {
        const user = this.users.get(userId)!;
        const userBadges = Array.from(this.userBadges.values())
          .filter((userBadge) => userBadge.userId === userId)
          .map((userBadge) => this.badges.get(userBadge.badgeId)!);
        
        return {
          ...user,
          answerCount: stats.answerCount,
          totalUpvotes: stats.totalUpvotes,
          badges: userBadges
        };
      });
    
    // Sort by total upvotes descending
    return contributors.sort((a, b) => b.totalUpvotes - a.totalUpvotes);
  }
}

export const storage = new MemStorage();
