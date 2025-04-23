import { useQuery } from "@tanstack/react-query";
import { Application, JobStatus } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface ApplicationStats {
  applied: number;
  inReview: number;
  interview: number;
  rejected: number;
  offered: number;
  total: number;
}

const ApplicationTracker = () => {
  const { data, isLoading } = useQuery<ApplicationStats>({
    queryKey: ['/api/applications/stats'],
  });

  const calculateProgressPercentage = () => {
    if (!data) return 0;
    const total = data.total || 1; // Avoid division by zero
    const inProgress = data.inReview + data.interview + data.offered;
    return (inProgress / total) * 100;
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow rounded-lg">
        <CardContent className="px-4 py-5 sm:p-6 animate-pulse">
          <h2 className="text-lg font-medium text-gray-900">Application Tracker</h2>
          <p className="mt-1 text-sm text-gray-500">Track your job application statuses.</p>
          <div className="mt-5 space-y-5">
            <div className="w-full bg-gray-200 rounded-full h-2.5"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-2 bg-gray-100 rounded-lg h-16"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardContent className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900">Application Tracker</h2>
        <p className="mt-1 text-sm text-gray-500">Track your job application statuses.</p>
        
        <div className="mt-5 space-y-5">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={calculateProgressPercentage()} className="h-2.5" />
            <p className="text-xs text-gray-500 text-right">
              {data?.inReview || 0} in progress of {data?.total || 0} applications
            </p>
          </div>
          
          {/* Status Breakdown */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-700">{data?.applied || 0}</div>
              <div className="text-xs text-blue-600">Applied</div>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <div className="text-lg font-semibold text-yellow-700">{data?.inReview || 0}</div>
              <div className="text-xs text-yellow-600">In Review</div>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-700">{data?.interview || 0}</div>
              <div className="text-xs text-green-600">Interview</div>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <div className="text-lg font-semibold text-red-700">{data?.rejected || 0}</div>
              <div className="text-xs text-red-600">Rejected</div>
            </div>
          </div>
          
          <div className="text-center">
            <Link href="/applications">
              <Button variant="link" className="text-sm font-medium text-primary hover:text-primary/80">
                View all applications <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationTracker;
