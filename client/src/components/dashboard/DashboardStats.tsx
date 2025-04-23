import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowRight, Calendar, Equal } from "lucide-react";

interface StatsProps {
  stats?: {
    totalJobs: number;
    applicationsSubmitted: number;
    interviewsScheduled: number;
    responseRate: string;
    weeklyGrowth: string;
    applicationCount: number;
    nextInterview?: string;
    industryComparison: string;
  };
}

const DashboardStats = ({ stats }: StatsProps) => {
  if (!stats) {
    // Loading or empty state
    return (
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white overflow-hidden shadow rounded-lg p-5">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mt-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Stat Card: Total Jobs Tracked */}
      <Card className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Jobs Tracked</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalJobs}</dd>
          <div className="mt-3 flex items-center text-sm text-green-600">
            <ArrowUp className="mr-1.5 flex-shrink-0 h-4 w-4" />
            <span>{stats.weeklyGrowth} more than last week</span>
          </div>
        </div>
      </Card>

      {/* Stat Card: Applications Submitted */}
      <Card className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Applications Submitted</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.applicationsSubmitted}</dd>
          <div className="mt-3 flex items-center text-sm text-green-600">
            <ArrowUp className="mr-1.5 flex-shrink-0 h-4 w-4" />
            <span>{stats.applicationCount} this week</span>
          </div>
        </div>
      </Card>

      {/* Stat Card: Interviews Scheduled */}
      <Card className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Interviews Scheduled</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.interviewsScheduled}</dd>
          <div className="mt-3 flex items-center text-sm text-blue-600">
            <Calendar className="mr-1.5 flex-shrink-0 h-4 w-4" />
            <span>
              {stats.nextInterview ? `Next: ${stats.nextInterview}` : 'No upcoming interviews'}
            </span>
          </div>
        </div>
      </Card>

      {/* Stat Card: Response Rate */}
      <Card className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Response Rate</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.responseRate}</dd>
          <div className="mt-3 flex items-center text-sm text-yellow-600">
            <Equal className="mr-1.5 flex-shrink-0 h-4 w-4" />
            <span>{stats.industryComparison}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardStats;
