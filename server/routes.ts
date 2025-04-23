import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { LinkedInService } from "./services/linkedinService";
import { JobScraperService } from "./services/jobScraperService";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertJobSourceSchema, 
  insertJobSchema, 
  insertApplicationSchema, 
  insertInterviewQuestionSchema, 
  insertQuestionAnswerSchema,
  JobStatus,
  JobFields
} from "@shared/schema";

// Initialize services
const linkedInService = new LinkedInService();
const jobScraperService = new JobScraperService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real application, you would create a session here
      // For this implementation, we'll just return the user without the password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User endpoints
  app.get("/api/user/current", async (req, res) => {
    // For demo purposes, return a mock user
    // In a real application, this would check the session
    const user = await storage.getUserByUsername("demo_user");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // LinkedIn integration endpoints
  app.get("/api/linkedin/auth-url", async (req, res) => {
    try {
      const authUrl = linkedInService.getAuthorizationUrl();
      res.json({ authUrl });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate LinkedIn auth URL" });
    }
  });

  app.get("/api/auth/linkedin/callback", async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code || !state) {
        return res.status(400).json({ message: "Missing OAuth parameters" });
      }
      
      // Normally, we'd verify the state against what was stored in the session
      // For simplicity, we'll skip that here
      
      // Exchange the code for an access token and get user profile
      const userData = await linkedInService.handleCallback(code.toString());
      
      // In a real app, we would create or update a user here
      // For now, let's just update our demo user
      await storage.updateUserLinkedInProfile(1, userData);
      
      // Redirect to the dashboard
      res.redirect("/");
    } catch (error) {
      res.status(500).json({ message: "LinkedIn authentication failed" });
    }
  });

  app.post("/api/linkedin/disconnect", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1; // Using demo user for now
      
      await storage.disconnectLinkedIn(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to disconnect LinkedIn" });
    }
  });

  // Job Sources endpoints
  app.get("/api/job-sources", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1; // Using demo user for now
      
      const sources = await storage.getJobSourcesByUserId(userId);
      res.json(sources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job sources" });
    }
  });

  app.post("/api/job-sources", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1; // Using demo user for now
      
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }
      
      // Validate and normalize the URL
      const name = jobScraperService.getSourceNameFromUrl(url);
      
      const sourceData = insertJobSourceSchema.parse({
        userId,
        url,
        name
      });
      
      const source = await storage.createJobSource(sourceData);
      
      // Immediately sync to fetch jobs
      const jobs = await jobScraperService.scrapeJobs(source);
      
      // Save the jobs to the database
      for (const job of jobs) {
        await storage.createJob({
          ...job,
          sourceId: source.id
        });
      }
      
      // Update the last synced time
      await storage.updateJobSourceLastSynced(source.id);
      
      res.status(201).json(source);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid source data" });
    }
  });

  app.post("/api/job-sources/:id/sync", async (req, res) => {
    try {
      const sourceId = parseInt(req.params.id);
      
      if (isNaN(sourceId)) {
        return res.status(400).json({ message: "Invalid source ID" });
      }
      
      const source = await storage.getJobSource(sourceId);
      
      if (!source) {
        return res.status(404).json({ message: "Job source not found" });
      }
      
      // Scrape jobs from the source
      const jobs = await jobScraperService.scrapeJobs(source);
      
      // Save the jobs to the database
      for (const job of jobs) {
        await storage.createJob({
          ...job,
          sourceId: source.id
        });
      }
      
      // Update the last synced time
      await storage.updateJobSourceLastSynced(sourceId);
      
      res.json({ success: true, jobsCount: jobs.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to sync job source" });
    }
  });

  app.delete("/api/job-sources/:id", async (req, res) => {
    try {
      const sourceId = parseInt(req.params.id);
      
      if (isNaN(sourceId)) {
        return res.status(400).json({ message: "Invalid source ID" });
      }
      
      const source = await storage.getJobSource(sourceId);
      
      if (!source) {
        return res.status(404).json({ message: "Job source not found" });
      }
      
      await storage.deleteJobSource(sourceId);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete job source" });
    }
  });

  // Jobs endpoints
  app.get("/api/jobs", async (req, res) => {
    try {
      const filter = req.query.filter as string || "all";
      
      let jobs;
      if (filter === "freshers") {
        jobs = await storage.getJobsByFilter({ isFresher: true });
      } else if (filter === "internships") {
        jobs = await storage.getJobsByFilter({ isInternship: true });
      } else {
        jobs = await storage.getAllJobs();
      }
      
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/search", async (req, res) => {
    try {
      const { query, location, filter, page = "1" } = req.query;
      const pageNumber = parseInt(page as string);
      const pageSize = 10;
      
      if (isNaN(pageNumber) || pageNumber < 1) {
        return res.status(400).json({ message: "Invalid page number" });
      }
      
      const filterOptions: Record<string, any> = {};
      
      if (filter === "freshers") {
        filterOptions.isFresher = true;
      } else if (filter === "internships") {
        filterOptions.isInternship = true;
      }
      
      if (query) {
        filterOptions.title = query as string;
      }
      
      if (location) {
        filterOptions.location = location as string;
      }
      
      const { jobs, total } = await storage.searchJobs(filterOptions, pageNumber, pageSize);
      const totalPages = Math.ceil(total / pageSize);
      
      res.json({
        jobs,
        total,
        pages: totalPages,
        page: pageNumber
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to search jobs" });
    }
  });

  app.post("/api/jobs/:id/save", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const userId = 1; // Using demo user for now
      
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      await storage.saveJob(userId, jobId);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to save job" });
    }
  });

  app.get("/api/jobs/saved", async (req, res) => {
    try {
      const userId = 1; // Using demo user for now
      
      const savedJobs = await storage.getSavedJobs(userId);
      
      res.json(savedJobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saved jobs" });
    }
  });

  // Applications endpoints
  app.get("/api/applications", async (req, res) => {
    try {
      const userId = 1; // Using demo user for now
      const status = req.query.status as string;
      
      let applications;
      if (status && status !== "all") {
        applications = await storage.getApplicationsByStatus(userId, status);
      } else {
        applications = await storage.getApplicationsByUserId(userId);
      }
      
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const userId = 1; // Using demo user for now
      const { jobId } = req.body;
      
      if (!jobId) {
        return res.status(400).json({ message: "Job ID is required" });
      }
      
      const job = await storage.getJob(parseInt(jobId));
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      const applicationData = insertApplicationSchema.parse({
        userId,
        jobId: parseInt(jobId),
        status: JobStatus.APPLIED,
        appliedDate: new Date(),
        notes: ""
      });
      
      const application = await storage.createApplication(applicationData);
      
      res.status(201).json(application);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid application data" });
    }
  });

  app.patch("/api/applications/:id", async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { status, notes } = req.body;
      
      if (isNaN(applicationId)) {
        return res.status(400).json({ message: "Invalid application ID" });
      }
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      const updatedApplication = await storage.updateApplication(applicationId, { status, notes });
      
      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  app.get("/api/applications/stats", async (req, res) => {
    try {
      const userId = 1; // Using demo user for now
      
      const stats = await storage.getApplicationStats(userId);
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch application stats" });
    }
  });

  // Interview Questions endpoints
  app.get("/api/interview-questions", async (req, res) => {
    try {
      const field = req.query.field as string || "frontend";
      const category = req.query.category as string || "all";
      
      let questions;
      if (category === "popular") {
        questions = await storage.getPopularInterviewQuestions(field);
      } else if (category === "bookmarked") {
        const userId = 1; // Using demo user for now
        questions = await storage.getBookmarkedInterviewQuestions(userId, field);
      } else {
        questions = await storage.getInterviewQuestionsByField(field);
      }
      
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interview questions" });
    }
  });

  app.get("/api/interview-questions/daily", async (req, res) => {
    try {
      const userId = 1; // Using demo user for now
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get a question based on the user's preferred field
      const field = user.preferredField || JobFields.FRONTEND;
      
      const dailyQuestion = await storage.getDailyInterviewQuestion(field);
      
      if (!dailyQuestion) {
        return res.status(404).json({ message: "No daily question available" });
      }
      
      res.json(dailyQuestion);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily question" });
    }
  });

  app.post("/api/interview-questions/answers", async (req, res) => {
    try {
      const userId = 1; // Using demo user for now
      const { questionId, answer } = req.body;
      
      if (!questionId || !answer) {
        return res.status(400).json({ message: "Question ID and answer are required" });
      }
      
      const question = await storage.getInterviewQuestion(parseInt(questionId));
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      const answerData = insertQuestionAnswerSchema.parse({
        questionId: parseInt(questionId),
        userId,
        answer,
        createdAt: new Date()
      });
      
      const createdAnswer = await storage.createQuestionAnswer(answerData);
      
      // Check if the user earns a badge for this answer
      await storage.checkAndAwardBadges(userId);
      
      res.status(201).json(createdAnswer);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid answer data" });
    }
  });

  app.post("/api/interview-questions/answers/:id/upvote", async (req, res) => {
    try {
      const answerId = parseInt(req.params.id);
      
      if (isNaN(answerId)) {
        return res.status(400).json({ message: "Invalid answer ID" });
      }
      
      const answer = await storage.getQuestionAnswer(answerId);
      
      if (!answer) {
        return res.status(404).json({ message: "Answer not found" });
      }
      
      const updatedAnswer = await storage.upvoteQuestionAnswer(answerId);
      
      // Check if the user earns a badge for this upvote
      await storage.checkAndAwardBadges(answer.userId);
      
      res.json(updatedAnswer);
    } catch (error) {
      res.status(500).json({ message: "Failed to upvote answer" });
    }
  });

  app.post("/api/interview-questions/:id/bookmark", async (req, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const userId = 1; // Using demo user for now
      
      if (isNaN(questionId)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }
      
      const question = await storage.getInterviewQuestion(questionId);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      await storage.bookmarkInterviewQuestion(userId, questionId);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to bookmark question" });
    }
  });

  // Community endpoints
  app.get("/api/community/top-contributors", async (req, res) => {
    try {
      const contributors = await storage.getTopContributors();
      
      res.json(contributors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top contributors" });
    }
  });

  app.get("/api/community/recent-answers", async (req, res) => {
    try {
      const answers = await storage.getRecentAnswers();
      
      res.json(answers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent answers" });
    }
  });

  // Badges endpoints
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  app.get("/api/badges/user", async (req, res) => {
    try {
      const userId = 1; // Using demo user for now
      
      const userBadges = await storage.getUserBadges(userId);
      
      res.json({ badges: userBadges });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  app.get("/api/badges/user/interview", async (req, res) => {
    try {
      const userId = 1; // Using demo user for now
      
      const userBadges = await storage.getUserInterviewBadges(userId);
      
      res.json(userBadges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user interview badges" });
    }
  });

  // Notifications endpoints
  app.get("/api/notifications/count", async (req, res) => {
    try {
      const userId = 1; // Using demo user for now
      
      // For the demo, just return a static count
      // In a real app, this would fetch from the database
      res.json({ count: 3 });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notification count" });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = 1; // Using demo user for now
      
      // Get application stats
      const applicationStats = await storage.getApplicationStats(userId);
      
      // For the demo, return some static stats
      // In a real app, these would be calculated from actual data
      res.json({
        totalJobs: 142,
        applicationsSubmitted: applicationStats.total || 0,
        interviewsScheduled: applicationStats.interview || 0,
        responseRate: "23%",
        weeklyGrowth: "12%",
        applicationCount: 4,
        nextInterview: applicationStats.interview > 0 ? "Tomorrow, 2:30 PM" : undefined,
        industryComparison: "Similar to industry average"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
