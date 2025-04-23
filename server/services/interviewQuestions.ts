import { storage } from '../storage';
import { InterviewQuestion, QuestionAnswer } from '@shared/schema';

export type QuestionStats = {
  total: number;
  completed: number;
  byService: Record<string, number>;
  byDifficulty: Record<string, number>;
};

export type ServiceCompletion = Record<string, {
  total: number;
  completed: number;
}>;

/**
 * Get statistics about interview questions
 */
export async function getInterviewStats(userId: number): Promise<QuestionStats> {
  const allQuestions = await storage.getAllInterviewQuestions();
  const userAnswers = await storage.getQuestionAnswersByUser(userId);
  
  // Count questions by service
  const byService: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  
  allQuestions.forEach(question => {
    // Count by AWS service
    const service = question.awsService || 'General';
    byService[service] = (byService[service] || 0) + 1;
    
    // Count by difficulty
    const difficulty = question.difficulty || 'medium';
    byDifficulty[difficulty] = (byDifficulty[difficulty] || 0) + 1;
  });
  
  // Calculate how many questions the user has completed
  const answeredQuestionIds = new Set(userAnswers.map(a => a.questionId));
  const completed = answeredQuestionIds.size;
  
  return {
    total: allQuestions.length,
    completed,
    byService,
    byDifficulty
  };
}

/**
 * Get user completion statistics by AWS service
 */
export async function getUserServiceCompletion(userId: number): Promise<ServiceCompletion> {
  const allQuestions = await storage.getAllInterviewQuestions();
  const userAnswers = await storage.getQuestionAnswersByUser(userId);
  
  // Group questions by service
  const questionsByService: Record<string, InterviewQuestion[]> = {};
  allQuestions.forEach(question => {
    const service = question.awsService || 'General';
    if (!questionsByService[service]) {
      questionsByService[service] = [];
    }
    questionsByService[service].push(question);
  });
  
  // Set of questions the user has answered
  const answeredQuestionIds = new Set(userAnswers.map(a => a.questionId));
  
  // Calculate completion by service
  const completion: ServiceCompletion = {};
  
  Object.entries(questionsByService).forEach(([service, questions]) => {
    const total = questions.length;
    let completed = 0;
    
    questions.forEach(question => {
      if (answeredQuestionIds.has(question.id)) {
        completed++;
      }
    });
    
    completion[service] = { total, completed };
  });
  
  return completion;
}

/**
 * Get daily interview question
 */
export async function getDailyQuestion(): Promise<InterviewQuestion | null> {
  const questions = await storage.getAllInterviewQuestions();
  if (questions.length === 0) return null;
  
  // Get a pseudo-random question based on the day of the year
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const questionIndex = dayOfYear % questions.length;
  
  return questions[questionIndex];
}

/**
 * Get questions by AWS service
 */
export async function getQuestionsByService(service: string): Promise<InterviewQuestion[]> {
  const questions = await storage.getAllInterviewQuestions();
  return questions.filter(q => q.awsService === service);
}

/**
 * Get top AWS services to focus on based on job descriptions
 */
export async function getTopAwsServicesFromJobs(userId: number): Promise<Record<string, number>> {
  const jobs = await storage.getAllJobs();
  
  // Count AWS services mentioned in job descriptions
  const serviceCounts: Record<string, number> = {};
  
  jobs.forEach(job => {
    // Check AWS services in the job
    const services = job.awsServices || [];
    services.forEach(service => {
      serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    });
  });
  
  // Sort by count
  return Object.fromEntries(
    Object.entries(serviceCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5) // Top 5 services
  );
}