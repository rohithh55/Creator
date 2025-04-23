import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { InterviewQuestion, QuestionAnswer } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface QuestionWithAnswers extends InterviewQuestion {
  answers: QuestionAnswer[];
}

interface UseInterviewQuestionsReturn {
  questions: QuestionWithAnswers[] | undefined;
  dailyQuestion: QuestionWithAnswers | undefined;
  isLoading: boolean;
  isDailyLoading: boolean;
  submitAnswer: (questionId: number, answer: string) => Promise<void>;
  upvoteAnswer: (answerId: number) => Promise<void>;
  bookmarkQuestion: (questionId: number) => Promise<void>;
  isSubmitting: boolean;
  isUpvoting: boolean;
  isBookmarking: boolean;
}

export const useInterviewQuestions = (field?: string, category?: string): UseInterviewQuestionsReturn => {
  const { toast } = useToast();

  const { data: questions, isLoading } = useQuery<QuestionWithAnswers[]>({
    queryKey: ['/api/interview-questions', field, category],
  });

  const { data: dailyQuestion, isLoading: isDailyLoading } = useQuery<QuestionWithAnswers>({
    queryKey: ['/api/interview-questions/daily'],
  });

  const submitAnswerMutation = useMutation({
    mutationFn: ({ questionId, answer }: { questionId: number; answer: string }) => 
      apiRequest('POST', '/api/interview-questions/answers', { questionId, answer }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interview-questions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/interview-questions/daily'] });
      toast({
        title: 'Answer Submitted',
        description: 'Your answer has been submitted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit your answer. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const upvoteAnswerMutation = useMutation({
    mutationFn: (answerId: number) => 
      apiRequest('POST', `/api/interview-questions/answers/${answerId}/upvote`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interview-questions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/interview-questions/daily'] });
      toast({
        title: 'Upvoted',
        description: 'You have upvoted this answer.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Upvote Failed',
        description: error.message || 'Failed to upvote the answer. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const bookmarkQuestionMutation = useMutation({
    mutationFn: (questionId: number) => 
      apiRequest('POST', `/api/interview-questions/${questionId}/bookmark`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interview-questions'] });
      toast({
        title: 'Question Bookmarked',
        description: 'This question has been added to your bookmarks.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Bookmark Failed',
        description: error.message || 'Failed to bookmark the question. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const submitAnswer = async (questionId: number, answer: string): Promise<void> => {
    if (!answer.trim()) {
      toast({
        title: 'Empty Answer',
        description: 'Please provide an answer before submitting.',
        variant: 'destructive',
      });
      return;
    }
    
    await submitAnswerMutation.mutateAsync({ questionId, answer });
  };

  const upvoteAnswer = async (answerId: number): Promise<void> => {
    await upvoteAnswerMutation.mutateAsync(answerId);
  };

  const bookmarkQuestion = async (questionId: number): Promise<void> => {
    await bookmarkQuestionMutation.mutateAsync(questionId);
  };

  return {
    questions,
    dailyQuestion,
    isLoading,
    isDailyLoading,
    submitAnswer,
    upvoteAnswer,
    bookmarkQuestion,
    isSubmitting: submitAnswerMutation.isPending,
    isUpvoting: upvoteAnswerMutation.isPending,
    isBookmarking: bookmarkQuestionMutation.isPending,
  };
};

export default useInterviewQuestions;
