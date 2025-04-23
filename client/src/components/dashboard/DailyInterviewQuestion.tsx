import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { InterviewQuestion, QuestionAnswer, UserBadge, Badge as BadgeType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Award, Loader2, Flame, Star, Lock } from "lucide-react";

interface DailyQuestion extends InterviewQuestion {
  answerCount: number;
}

const DailyInterviewQuestion = () => {
  const [answer, setAnswer] = useState("");
  const { toast } = useToast();

  const { data: question, isLoading: loadingQuestion } = useQuery<DailyQuestion>({
    queryKey: ['/api/interview-questions/daily'],
  });

  const { data: badges, isLoading: loadingBadges } = useQuery<(UserBadge & { badge: BadgeType })[]>({
    queryKey: ['/api/badges/user/interview'],
  });

  const submitAnswerMutation = useMutation({
    mutationFn: (data: { questionId: number; answer: string }) => 
      apiRequest("POST", "/api/interview-questions/answers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interview-questions/daily'] });
      setAnswer("");
      toast({
        title: "Answer Submitted",
        description: "Your answer has been submitted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit your answer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitAnswer = () => {
    if (!question) return;
    
    if (!answer.trim()) {
      toast({
        title: "Empty Answer",
        description: "Please provide an answer before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    submitAnswerMutation.mutate({
      questionId: question.id,
      answer,
    });
  };

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Daily Interview Prep</h2>
          {question && (
            <Badge className="bg-primary text-white">{question.field}</Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500">Practice with daily questions for your field.</p>
        
        {loadingQuestion ? (
          <div className="mt-5 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : question ? (
          <div className="mt-5">
            <h3 className="text-base font-medium text-gray-800">{question.question}</h3>
            
            <div className="mt-4">
              <Textarea 
                rows={3} 
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md" 
                placeholder="Type your answer here..." 
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>
            
            <div className="mt-3 flex justify-between items-center">
              <Button
                className="inline-flex items-center"
                onClick={handleSubmitAnswer}
                disabled={submitAnswerMutation.isPending}
              >
                {submitAnswerMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Answer
              </Button>
              
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">{question.answerCount} community answers</span>
                <Button variant="link" size="sm" className="text-primary hover:text-primary/80 p-0">View</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 text-center py-4">
            <p className="text-gray-500">No daily question available.</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for a new question.</p>
          </div>
        )}
        
        {/* User Badges */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">Your Interview Prep Badges</h3>
          
          {loadingBadges ? (
            <div className="mt-2 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : badges && badges.length > 0 ? (
            <div className="mt-2 flex space-x-4">
              {badges.map((userBadge) => (
                <div key={userBadge.id} className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {userBadge.badge.icon === 'fire' && <Flame className="text-purple-600 h-5 w-5" />}
                    {userBadge.badge.icon === 'star' && <Star className="text-blue-600 h-5 w-5" />}
                    {userBadge.badge.icon === 'award' && <Award className="text-green-600 h-5 w-5" />}
                  </div>
                  <span className="mt-1 text-xs text-gray-600">{userBadge.badge.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 flex space-x-4">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Flame className="text-purple-500 h-5 w-5" />
                </div>
                <span className="mt-1 text-xs text-gray-600">7-Day Streak</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Star className="text-blue-500 h-5 w-5" />
                </div>
                <span className="mt-1 text-xs text-gray-600">Top Contributor</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Lock className="text-gray-400 h-5 w-5" />
                </div>
                <span className="mt-1 text-xs text-gray-400">Problem Solver</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyInterviewQuestion;
