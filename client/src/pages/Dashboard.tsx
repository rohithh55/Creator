import { useState } from "react";
import DashboardStats from "@/components/dashboard/DashboardStats";
import JobSourceIntegration from "@/components/dashboard/JobSourceIntegration";
import RecentJobListings from "@/components/dashboard/RecentJobListings";
import LinkedInIntegration from "@/components/dashboard/LinkedInIntegration";
import ApplicationTracker from "@/components/dashboard/ApplicationTracker";
import DailyInterviewQuestion from "@/components/dashboard/DailyInterviewQuestion";
import { useQuery } from "@tanstack/react-query";
import { Job } from "@shared/schema";

const Dashboard = () => {
  const [jobFilter, setJobFilter] = useState<'all' | 'freshers' | 'internships'>('freshers');

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
  });

  const { data: jobs } = useQuery<Job[]>({
    queryKey: ['/api/jobs', jobFilter],
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setJobFilter(e.target.value as 'all' | 'freshers' | 'internships');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900">Job Search Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Track your job search journey and optimize your applications.</p>
      </div>

      {/* Dashboard Stats Section */}
      <DashboardStats stats={stats} />

      {/* Main Dashboard Content */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Application Tracking & Job Sources */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Source Integration Section */}
          <JobSourceIntegration />
          
          {/* Recent Job Listings Section */}
          <RecentJobListings 
            jobs={jobs || []} 
            onFilterChange={handleFilterChange}
            currentFilter={jobFilter}
          />
        </div>

        {/* Right Column: Profile & Interview Prep */}
        <div className="space-y-6">
          {/* LinkedIn Integration Section */}
          <LinkedInIntegration />
          
          {/* Application Tracker */}
          <ApplicationTracker />
          
          {/* Daily Interview Question */}
          <DailyInterviewQuestion />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
