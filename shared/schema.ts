import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  linkedinConnected: boolean("linkedin_connected").default(false),
  linkedinToken: text("linkedin_token"),
  linkedinProfileData: json("linkedin_profile_data"),
  preferredField: text("preferred_field"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  preferredField: true,
});

// Job Sources table
export const jobSources = pgTable("job_sources", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  url: text("url").notNull(),
  name: text("name").notNull(),
  lastSynced: timestamp("last_synced"),
});

export const insertJobSourceSchema = createInsertSchema(jobSources).pick({
  userId: true,
  url: true,
  name: true,
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  jobType: text("job_type").notNull(),
  description: text("description").notNull(),
  salaryRange: text("salary_range"),
  postedDate: timestamp("posted_date").notNull(),
  url: text("url").notNull(),
  sourceId: integer("source_id").notNull(),
  isEasyApply: boolean("is_easy_apply").default(false),
  isFresher: boolean("is_fresher").default(false),
  isInternship: boolean("is_internship").default(false),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
});

// Applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  jobId: integer("job_id").notNull(),
  status: text("status").notNull(), // applied, in_review, interview, rejected, offered
  appliedDate: timestamp("applied_date").notNull(),
  notes: text("notes"),
});

export const insertApplicationSchema = createInsertSchema(applications).pick({
  userId: true,
  jobId: true,
  status: true,
  appliedDate: true,
  notes: true,
});

// Interview Questions table
export const interviewQuestions = pgTable("interview_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  field: text("field").notNull(), // e.g., frontend, backend, data_science
  difficulty: text("difficulty").notNull(), // easy, medium, hard
  isPinned: boolean("is_pinned").default(false),
});

export const insertInterviewQuestionSchema = createInsertSchema(interviewQuestions).pick({
  question: true,
  field: true,
  difficulty: true,
});

// Question Answers table
export const questionAnswers = pgTable("question_answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull(),
  userId: integer("user_id").notNull(),
  answer: text("answer").notNull(),
  upvotes: integer("upvotes").default(0),
  createdAt: timestamp("created_at").notNull(),
});

export const insertQuestionAnswerSchema = createInsertSchema(questionAnswers).pick({
  questionId: true,
  userId: true,
  answer: true,
  createdAt: true,
});

// User Badges table
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  awardedDate: timestamp("awarded_date").notNull(),
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).pick({
  userId: true,
  badgeId: true,
  awardedDate: true,
});

// Badges table
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // Font Awesome icon name
  requiredScore: integer("required_score").notNull(),
  category: text("category").notNull(), // e.g., streak, contribution, problem_solving
});

export const insertBadgeSchema = createInsertSchema(badges).pick({
  name: true,
  description: true,
  icon: true,
  requiredScore: true,
  category: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type JobSource = typeof jobSources.$inferSelect;
export type InsertJobSource = z.infer<typeof insertJobSourceSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type InterviewQuestion = typeof interviewQuestions.$inferSelect;
export type InsertInterviewQuestion = z.infer<typeof insertInterviewQuestionSchema>;

export type QuestionAnswer = typeof questionAnswers.$inferSelect;
export type InsertQuestionAnswer = z.infer<typeof insertQuestionAnswerSchema>;

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

// Enum-like constants
export const JobStatus = {
  APPLIED: "applied",
  IN_REVIEW: "in_review",
  INTERVIEW: "interview",
  REJECTED: "rejected",
  OFFERED: "offered",
} as const;

export const JobFields = {
  FRONTEND: "frontend",
  BACKEND: "backend",
  FULLSTACK: "fullstack",
  DATA_SCIENCE: "data_science",
  DESIGN: "design",
  PRODUCT: "product",
  MARKETING: "marketing",
  PYTHON: "python",
  AWS: "aws",
  KUBERNETES: "kubernetes",
  TERRAFORM: "terraform",
  DEVOPS: "devops",
} as const;

export const BadgeCategories = {
  STREAK: "streak",
  CONTRIBUTION: "contribution",
  PROBLEM_SOLVING: "problem_solving",
} as const;
