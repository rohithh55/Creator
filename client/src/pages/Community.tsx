import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge as BadgeType, User, QuestionAnswer } from "@shared/schema";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, ThumbsUp, Award, Search } from "lucide-react";

type TopContributorUser = User & { 
  answerCount: number;
  totalUpvotes: number;
  badges: BadgeType[];
};

type RecentAnswer = QuestionAnswer & {
  user: User;
  question: { id: number; question: string; field: string };
};

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("contributors");

  const { data: topContributors, isLoading: loadingContributors } = useQuery<TopContributorUser[]>({
    queryKey: ['/api/community/top-contributors'],
  });

  const { data: recentAnswers, isLoading: loadingAnswers } = useQuery<RecentAnswer[]>({
    queryKey: ['/api/community/recent-answers'],
  });

  const { data: badges, isLoading: loadingBadges } = useQuery<BadgeType[]>({
    queryKey: ['/api/badges'],
  });

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900">Community</h1>
        <p className="mt-1 text-sm text-gray-600">Interact with other job seekers and contribute to the community.</p>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center">
              <div>
                <CardTitle>JobFlow Community</CardTitle>
                <CardDescription>Connect, learn, and grow with fellow job seekers</CardDescription>
              </div>
              <div className="mt-4 md:mt-0 relative flex items-center">
                <Search className="absolute left-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search community..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full md:w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="contributors" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="contributors">Top Contributors</TabsTrigger>
                <TabsTrigger value="recent">Recent Answers</TabsTrigger>
                <TabsTrigger value="badges">Badges</TabsTrigger>
              </TabsList>
              
              <TabsContent value="contributors">
                {loadingContributors ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : topContributors && topContributors.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Answers</TableHead>
                          <TableHead>Upvotes</TableHead>
                          <TableHead>Badges</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topContributors.map((user, index) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">#{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.username}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MessageSquare className="h-4 w-4 mr-1 text-blue-500" />
                                {user.answerCount}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <ThumbsUp className="h-4 w-4 mr-1 text-green-500" />
                                {user.totalUpvotes}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {user.badges.map((badge) => (
                                  <Badge key={badge.id} variant="outline" className="bg-gray-100">
                                    {badge.name}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg text-gray-600">No contributors data available yet.</p>
                    <p className="text-sm text-gray-500 mt-1">Be the first to contribute answers!</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="recent">
                {loadingAnswers ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : recentAnswers && recentAnswers.length > 0 ? (
                  <div className="space-y-6">
                    {recentAnswers.map((answer) => (
                      <Card key={answer.id} className="border-2 border-muted">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>{answer.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{answer.user.username}</div>
                                <div className="text-xs text-gray-500">
                                  {new Date(answer.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <Badge>{answer.question.field}</Badge>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-md mb-3">
                            <p className="text-sm font-medium">{answer.question.question}</p>
                          </div>
                          
                          <div className="text-sm text-gray-700">
                            {answer.answer}
                          </div>
                          
                          <div className="mt-4 flex justify-between items-center">
                            <Button variant="ghost" size="sm" className="text-gray-500">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {answer.upvotes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-primary">
                              View Question
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg text-gray-600">No recent answers available.</p>
                    <p className="text-sm text-gray-500 mt-1">Be the first to answer interview questions!</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="badges">
                {loadingBadges ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : badges && badges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badges.map((badge) => (
                      <Card key={badge.id} className="border-2 border-muted">
                        <CardContent className="flex items-center p-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                            <Award className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{badge.name}</h3>
                            <p className="text-sm text-gray-500">{badge.description}</p>
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs">
                                {badge.category} • {badge.requiredScore} points
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg text-gray-600">No badges available yet.</p>
                    <p className="text-sm text-gray-500 mt-1">Check back soon for community badges!</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Community;
