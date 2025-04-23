import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  Database, 
  Server, 
  HardDrive, 
  Network, 
  Shield, 
  Cloud, 
  Users, 
  Monitor, 
  Activity
} from 'lucide-react';

// AWS service colors
const AWS_COLORS = {
  RDS: '#3F8624',
  DynamoDB: '#4D27AA',
  EC2: '#FF9900',
  IAM: '#DD344C',
  S3: '#E63F8C',
  VPC: '#2E73B8', 
  EKS: '#7AA116',
  Lambda: '#FF9900',
  CloudWatch: '#FF4F8B',
  Route53: '#693CC5',
  General: '#232F3E'
};

// Service icons mapping
const ServiceIcon = ({ service }: { service: string }) => {
  switch(service) {
    case 'RDS':
      return <Database className="w-5 h-5 mr-2" />;
    case 'DynamoDB':
      return <Database className="w-5 h-5 mr-2" />;
    case 'EC2':
      return <Server className="w-5 h-5 mr-2" />;
    case 'S3':
      return <HardDrive className="w-5 h-5 mr-2" />;
    case 'VPC':
      return <Network className="w-5 h-5 mr-2" />;
    case 'IAM':
      return <Shield className="w-5 h-5 mr-2" />;
    case 'EKS':
      return <Cloud className="w-5 h-5 mr-2" />;
    case 'Route53':
      return <Activity className="w-5 h-5 mr-2" />;
    case 'CloudWatch':
      return <Monitor className="w-5 h-5 mr-2" />;
    default:
      return <Users className="w-5 h-5 mr-2" />;
  }
};

const AWSInterviewStats = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch AWS interview stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/interview-questions/stats'],
  });

  // Fetch AWS service completion stats
  const { data: completion, isLoading: completionLoading } = useQuery({
    queryKey: ['/api/interview-questions/user-completion'],
  });

  // Calculate data for pie chart
  const prepareChartData = () => {
    if (!stats) return [];
    
    return Object.entries(stats.byService || {}).map(([name, count]) => ({
      name,
      value: count,
      color: AWS_COLORS[name as keyof typeof AWS_COLORS] || '#999999'
    }));
  };

  const chartData = prepareChartData();

  if (statsLoading || completionLoading) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>AWS Interview Question Stats</CardTitle>
          <CardDescription>Loading stats...</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>AWS Interview Preparation</CardTitle>
        <CardDescription>Track your progress with AWS-specific interview questions</CardDescription>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="overview" 
            onClick={() => setActiveTab('overview')}
            className={activeTab === 'overview' ? 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : ''}
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="services" 
            onClick={() => setActiveTab('services')}
            className={activeTab === 'services' ? 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : ''}
          >
            AWS Services
          </TabsTrigger>
          <TabsTrigger 
            value="progress" 
            onClick={() => setActiveTab('progress')}
            className={activeTab === 'progress' ? 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : ''}
          >
            Your Progress
          </TabsTrigger>
        </TabsList>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} className="space-y-4">
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-xl">Total Questions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-3xl font-bold">{stats?.total || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-xl">Completed</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-3xl font-bold">{stats?.completed || 0}</p>
                  <Progress value={(stats?.completed / stats?.total || 0) * 100} className="h-2 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-xl">AWS Services</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-3xl font-bold">{Object.keys(stats?.byService || {}).length}</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="p-4">
                <CardTitle>Question Distribution</CardTitle>
                <CardDescription>AWS services coverage in interview questions</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} questions`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(stats?.byService || {}).map(([service, count]) => (
                <Card key={service}>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="flex items-center">
                      <ServiceIcon service={service} />
                      {service}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{count} questions</span>
                      <span className="text-sm font-medium">
                        {completion?.[service]?.completed || 0} completed
                      </span>
                    </div>
                    <Progress 
                      value={(completion?.[service]?.completed / (count as number) || 0) * 100} 
                      className="h-2 mt-2" 
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle>Your AWS Interview Readiness</CardTitle>
                <CardDescription>Based on completed questions and performance</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Overall Readiness</span>
                      <span className="text-sm font-medium">
                        {Math.round((stats?.completed / stats?.total || 0) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(stats?.completed / stats?.total || 0) * 100} 
                      className="h-2 mt-2" 
                    />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-4">AWS Service Readiness</h4>
                    <div className="space-y-3">
                      {Object.entries(completion || {}).map(([service, data]) => (
                        <div key={service}>
                          <div className="flex justify-between items-center">
                            <span className="flex items-center">
                              <ServiceIcon service={service} />
                              {service}
                            </span>
                            <span className="text-sm font-medium">
                              {Math.round((data.completed / data.total || 0) * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={(data.completed / data.total || 0) * 100} 
                            className="h-1.5 mt-1"
                            style={{ 
                              backgroundColor: 'rgba(0,0,0,0.1)', 
                              '--tw-progress-bar-color': AWS_COLORS[service as keyof typeof AWS_COLORS] || '#999'
                            } as React.CSSProperties}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AWSInterviewStats;