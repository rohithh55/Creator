import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Job, JobFields } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, ExternalLink, Bookmark, SendIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const JobBoard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'freshers' | 'internships'>('all');
  const [techCategory, setTechCategory] = useState<string>('all');
  const [location, setLocation] = useState("");
  const { toast } = useToast();

  const { data: jobs, isLoading } = useQuery<{
    jobs: Job[],
    total: number,
    pages: number
  }>({
    queryKey: ['/api/jobs/search', searchTerm, filterType, techCategory, location, currentPage],
  });

  const handleApply = async (jobId: number) => {
    try {
      await apiRequest("POST", `/api/applications`, { jobId });
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted.",
      });
    } catch (error) {
      toast({
        title: "Application Failed",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveJob = async (jobId: number) => {
    try {
      await apiRequest("POST", `/api/jobs/${jobId}/save`);
      toast({
        title: "Job Saved",
        description: "This job has been saved to your favorites.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save job. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900">Job Board</h1>
        <p className="mt-1 text-sm text-gray-600">Find and apply to job opportunities that match your skills and experience.</p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Search Jobs</CardTitle>
          <CardDescription>Filter jobs based on your preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <Input
                placeholder="Search job titles, companies, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <Select onValueChange={(value) => setFilterType(value as any)} value={filterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  <SelectItem value="freshers">Freshers Only</SelectItem>
                  <SelectItem value="internships">Internships</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Technology Category</p>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <Button 
                variant={techCategory === 'all' ? "default" : "outline"} 
                size="sm"
                onClick={() => setTechCategory('all')}
              >
                All
              </Button>
              <Button 
                variant={techCategory === JobFields.PYTHON ? "default" : "outline"}
                size="sm" 
                onClick={() => setTechCategory(JobFields.PYTHON)}
              >
                Python
              </Button>
              <Button 
                variant={techCategory === JobFields.AWS ? "default" : "outline"} 
                size="sm"
                onClick={() => setTechCategory(JobFields.AWS)}
              >
                AWS
              </Button>
              <Button 
                variant={techCategory === JobFields.KUBERNETES ? "default" : "outline"} 
                size="sm"
                onClick={() => setTechCategory(JobFields.KUBERNETES)}
              >
                Kubernetes
              </Button>
              <Button 
                variant={techCategory === JobFields.TERRAFORM ? "default" : "outline"} 
                size="sm"
                onClick={() => setTechCategory(JobFields.TERRAFORM)}
              >
                Terraform
              </Button>
              <Button 
                variant={techCategory === JobFields.DEVOPS ? "default" : "outline"} 
                size="sm"
                onClick={() => setTechCategory(JobFields.DEVOPS)}
              >
                DevOps
              </Button>
            </div>
          </div>
          
          <Button className="mt-4">Search Jobs</Button>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Job Listings</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : jobs && jobs.jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex-shrink-0 mb-4 sm:mb-0">
                      <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                        {job.company.charAt(0)}
                      </div>
                    </div>
                    
                    <div className="ml-0 sm:ml-4 flex-grow">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-medium text-primary">{job.title}</h3>
                        <div className="flex items-center">
                          {job.isEasyApply && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Easy Apply
                            </Badge>
                          )}
                          {job.isInternship && (
                            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                              Internship
                            </Badge>
                          )}
                          {job.isFresher && (
                            <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800">
                              Fresher
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-1 text-sm text-gray-900 font-medium">{job.company}</div>
                      
                      <div className="mt-2 flex flex-wrap items-center text-sm text-gray-600 gap-y-1">
                        <div className="flex items-center mr-4">
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center mr-4">
                          <span>{job.jobType}</span>
                        </div>
                        <div className="flex items-center">
                          <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-500 line-clamp-2">
                        {job.description}
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button 
                          className="flex items-center gap-1.5" 
                          onClick={() => handleApply(job.id)}
                          disabled={!job.isEasyApply}
                        >
                          <SendIcon className="h-4 w-4" />
                          {job.isEasyApply ? "Easy Apply" : "Apply Manually"}
                        </Button>
                        
                        <Button variant="outline" className="flex items-center gap-1.5" asChild>
                          <a href={job.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            View Original
                          </a>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-1.5"
                          onClick={() => handleSaveJob(job.id)}
                        >
                          <Bookmark className="h-4 w-4" />
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, jobs.pages) }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {jobs.pages > 5 && (
                  <>
                    <PaginationItem>
                      <PaginationLink>...</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setCurrentPage(jobs.pages)}
                      >
                        {jobs.pages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(jobs.pages, p + 1))}
                    disabled={currentPage === jobs.pages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <CardContent>
              <div className="flex flex-col items-center">
                <p className="text-lg text-gray-600">No jobs found matching your criteria.</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your search filters or add more job sources.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JobBoard;
