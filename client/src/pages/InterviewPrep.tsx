import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { InterviewQuestion, QuestionAnswer, Badge as BadgeType, UserBadge, JobFields } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ThumbsUp, MessageSquare, Award } from "lucide-react";

type QuestionWithAnswers = InterviewQuestion & { 
  answers: QuestionAnswer[];
};

const InterviewPrep = () => {
  const [selectedField, setSelectedField] = useState<string>("aws");
  const [activeTab, setActiveTab] = useState("daily");
  const [answerText, setAnswerText] = useState("");
  const { toast } = useToast();

  const { data: questions, isLoading } = useQuery<QuestionWithAnswers[]>({
    queryKey: ['/api/interview-questions', selectedField, activeTab],
  });

  const { data: userBadges } = useQuery<{
    badges: (UserBadge & { badge: BadgeType })[]
  }>({
    queryKey: ['/api/badges/user'],
  });

  const submitAnswerMutation = useMutation({
    mutationFn: (data: { questionId: number, answer: string }) => 
      apiRequest("POST", "/api/interview-questions/answers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interview-questions'] });
      setAnswerText("");
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
    }
  });

  const upvoteAnswerMutation = useMutation({
    mutationFn: (answerId: number) => 
      apiRequest("POST", `/api/interview-questions/answers/${answerId}/upvote`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interview-questions'] });
      toast({
        title: "Upvoted",
        description: "You have upvoted this answer.",
      });
    },
    onError: () => {
      toast({
        title: "Upvote Failed",
        description: "Failed to upvote the answer. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmitAnswer = (questionId: number) => {
    if (!answerText.trim()) {
      toast({
        title: "Empty Answer",
        description: "Please provide an answer before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    submitAnswerMutation.mutate({
      questionId,
      answer: answerText
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900">AWS Cloud Interview Preparation</h1>
        <p className="mt-1 text-sm text-gray-600">Practice with AWS-specific interview questions and prepare for your cloud career.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Practice Questions</CardTitle>
                <CardDescription>Prepare for your interviews with these questions</CardDescription>
              </div>
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select AWS Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aws">All AWS</SelectItem>
                  <SelectItem value="ec2">EC2</SelectItem>
                  <SelectItem value="s3">S3</SelectItem>
                  <SelectItem value="rds">RDS</SelectItem>
                  <SelectItem value="iam">IAM</SelectItem>
                  <SelectItem value="vpc">VPC</SelectItem>
                  <SelectItem value="eks">EKS</SelectItem>
                  <SelectItem value="lambda">Lambda</SelectItem>
                  <SelectItem value="cloudformation">CloudFormation</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="daily">Daily Question</TabsTrigger>
                  <TabsTrigger value="all">All Questions</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab}>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : questions && questions.length > 0 ? (
                    <div className="space-y-6">
                      {questions.map((question) => (
                        <Card key={question.id} className="border-2 border-muted">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{question.question}</CardTitle>
                              <Badge className="bg-primary text-white">{question.field}</Badge>
                            </div>
                            <CardDescription className="flex items-center mt-2">
                              <Badge variant="outline" className="mr-2">
                                {question.difficulty}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {question.answers.length} {question.answers.length === 1 ? 'answer' : 'answers'}
                              </span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="mb-4">
                              <Textarea
                                placeholder="Type your answer here..."
                                className="min-h-[100px]"
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                              />
                              <Button 
                                className="mt-2" 
                                onClick={() => handleSubmitAnswer(question.id)}
                                disabled={submitAnswerMutation.isPending}
                              >
                                {submitAnswerMutation.isPending && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Submit Answer
                              </Button>
                            </div>
                            
                            {question.answers.length > 0 && (
                              <Accordion type="single" collapsible>
                                <AccordionItem value="answers">
                                  <AccordionTrigger>
                                    View Community Answers ({question.answers.length})
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="space-y-4 mt-2">
                                      {question.answers.map((answer) => (
                                        <div key={answer.id} className="bg-gray-50 p-4 rounded-lg">
                                          <div className="flex justify-between items-start">
                                            <div className="text-sm font-medium text-gray-900">
                                              User #{answer.userId}
                                            </div>
                                            <Button 
                                              variant="ghost" 
                                              size="sm"
                                              onClick={() => upvoteAnswerMutation.mutate(answer.id)}
                                              disabled={upvoteAnswerMutation.isPending}
                                            >
                                              <ThumbsUp className="h-4 w-4 mr-1" />
                                              {answer.upvotes}
                                            </Button>
                                          </div>
                                          <div className="mt-1 text-sm text-gray-700">
                                            {answer.answer}
                                          </div>
                                          <div className="mt-2 text-xs text-gray-500">
                                            Answered on {new Date(answer.createdAt).toLocaleDateString()}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-lg text-gray-600">No questions found.</p>
                      <p className="text-sm text-gray-500 mt-1">Try selecting a different field or category.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Badges</CardTitle>
              <CardDescription>Achievements you've earned from participating</CardDescription>
            </CardHeader>
            <CardContent>
              {userBadges?.badges && userBadges.badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {userBadges.badges.map((userBadge) => (
                    <div key={userBadge.id} className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div className="mt-2 text-center">
                        <div className="text-sm font-medium">{userBadge.badge.name}</div>
                        <div className="text-xs text-gray-500">{userBadge.badge.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Award className="h-12 w-12 text-gray-300 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">No badges earned yet</p>
                  <p className="text-xs text-gray-400">Contribute answers to earn badges</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>AWS Cloud Interview Tips</CardTitle>
              <CardDescription>Prepare for your AWS cloud role interview</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-2">
                    <span className="text-xs">✓</span>
                  </div>
                  <p className="text-sm text-gray-600">Review AWS architecture diagrams and best practices</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-2">
                    <span className="text-xs">✓</span>
                  </div>
                  <p className="text-sm text-gray-600">Practice explaining AWS resource deployment patterns</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-2">
                    <span className="text-xs">✓</span>
                  </div>
                  <p className="text-sm text-gray-600">Understand AWS Well-Architected Framework's 5 pillars</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-2">
                    <span className="text-xs">✓</span>
                  </div>
                  <p className="text-sm text-gray-600">Be ready to discuss your AWS certifications and projects</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-2">
                    <span className="text-xs">✓</span>
                  </div>
                  <p className="text-sm text-gray-600">Prepare examples of complex AWS solutions you've implemented</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-2">
                    <span className="text-xs">✓</span>
                  </div>
                  <p className="text-sm text-gray-600">Understand AWS cost optimization strategies</p>
                </li>
              </ul>
              
              <Button className="mt-4 w-full" variant="outline">
                View AWS Certification Paths
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;
