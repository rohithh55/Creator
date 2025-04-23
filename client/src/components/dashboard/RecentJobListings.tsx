import { useMutation } from "@tanstack/react-query";
import { Job } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SendIcon, ExternalLink, Bookmark, MapPin, Briefcase, Clock, Cloud } from "lucide-react";
import { AutoApplyButton } from "@/components/jobs/AutoApplyButton";

interface RecentJobListingsProps {
  jobs: Job[];
  onFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  currentFilter: 'all' | 'freshers' | 'internships';
}

const RecentJobListings = ({ jobs, onFilterChange, currentFilter }: RecentJobListingsProps) => {
  const { toast } = useToast();

  const applyMutation = useMutation({
    mutationFn: (jobId: number) => apiRequest("POST", "/api/applications", { jobId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted.",
      });
    },
    onError: () => {
      toast({
        title: "Application Failed",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveJobMutation = useMutation({
    mutationFn: (jobId: number) => apiRequest("POST", `/api/jobs/${jobId}/save`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/saved'] });
      toast({
        title: "Job Saved",
        description: "This job has been saved to your favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save job. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApply = (jobId: number) => {
    applyMutation.mutate(jobId);
  };

  const handleSave = (jobId: number) => {
    saveJobMutation.mutate(jobId);
  };

  const getLogoUrl = (company: string) => {
    // Try to get company logo using Clearbit
    return `https://logo.clearbit.com/${company.toLowerCase().replace(/\s+/g, '')}.com`;
  };

  const getTimeAgo = (postedDate: Date | string) => {
    const posted = postedDate instanceof Date ? postedDate : new Date(postedDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <Card className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
          <div>
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Cloud className="mr-2 h-5 w-5 text-blue-500" />
              AWS Cloud Job Matches
            </h2>
            <p className="mt-1 text-sm text-gray-500">AWS cloud positions that match your experience and certifications</p>
          </div>
          
          {/* Filtering Options */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
            <Select value={currentFilter} onValueChange={(value: any) => onFilterChange({ target: { value } } as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter jobs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All AWS Jobs</SelectItem>
                <SelectItem value="freshers">Entry Level</SelectItem>
                <SelectItem value="internships">Internships</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="flex items-center">
              AWS Services
            </Button>
          </div>
        </div>
      </div>
      
      {/* Job Listings */}
      <ul className="divide-y divide-gray-200">
        {jobs.length === 0 ? (
          <li className="p-8 text-center">
            <p className="text-gray-500">No jobs found matching your criteria.</p>
            <p className="text-sm text-gray-400 mt-1">Try adding more job sources or changing your filters.</p>
          </li>
        ) : (
          jobs.map((job) => (
            <li key={job.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row">
                {/* Company Logo */}
                <div className="flex-shrink-0 mb-4 sm:mb-0">
                  <img 
                    className="h-12 w-12 rounded-md object-contain bg-gray-100"
                    src={getLogoUrl(job.company)}
                    alt={`${job.company} logo`}
                    onError={(e) => {
                      // If logo loading fails, replace with first letter of company
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%23888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /></svg>';
                      // Add text overlay with first letter
                      setTimeout(() => {
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          const overlay = document.createElement('div');
                          overlay.style.position = 'absolute';
                          overlay.style.top = '0';
                          overlay.style.left = '0';
                          overlay.style.width = '100%';
                          overlay.style.height = '100%';
                          overlay.style.display = 'flex';
                          overlay.style.alignItems = 'center';
                          overlay.style.justifyContent = 'center';
                          overlay.style.fontSize = '1.25rem';
                          overlay.style.fontWeight = 'bold';
                          overlay.style.color = '#555';
                          overlay.textContent = job.company.charAt(0);
                          parent.style.position = 'relative';
                          parent.appendChild(overlay);
                        }
                      }, 0);
                    }}
                  />
                </div>
                
                {/* Job Details */}
                <div className="ml-0 sm:ml-4 flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-primary">{job.title}</h3>
                    <div className="flex items-center">
                      {job.isEasyApply && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Easy Apply</Badge>
                      )}
                      {job.isInternship && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">Internship</Badge>
                      )}
                      {job.isFresher && (
                        <Badge className="ml-2 bg-purple-100 text-purple-800 hover:bg-purple-200">Fresher</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-1 text-sm text-gray-900 font-medium">{job.company}</div>
                  
                  <div className="mt-2 flex flex-wrap items-center text-sm text-gray-600 gap-y-1">
                    <div className="flex items-center mr-4">
                      <MapPin className="mr-1.5 text-gray-400 h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center mr-4">
                      <Briefcase className="mr-1.5 text-gray-400 h-4 w-4" />
                      <span>{job.jobType}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1.5 text-gray-400 h-4 w-4" />
                      <span>Posted {getTimeAgo(job.postedDate)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-500 line-clamp-2">
                    {job.description}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="w-full sm:w-auto">
                      <AutoApplyButton
                        jobId={job.id}
                        isEasyApply={job.isEasyApply}
                        originalUrl={job.url}
                        sourceName={job.company}
                      />
                    </div>
                    
                    <Button variant="outline" className="flex items-center gap-1.5" asChild>
                      <a href={job.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        View Original
                      </a>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-1.5"
                      onClick={() => handleSave(job.id)}
                      disabled={saveJobMutation.isPending}
                    >
                      <Bookmark className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
      
      {/* Pagination */}
      {jobs.length > 0 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(10, jobs.length)}</span> of <span className="font-medium">{jobs.length}</span> results
              </p>
            </div>
            <div>
              <Button variant="outline" className="mr-2">Previous</Button>
              <Button variant="outline">Next</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RecentJobListings;
