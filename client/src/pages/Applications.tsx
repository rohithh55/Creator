import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Application, Job, JobStatus } from "@shared/schema";
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink, Calendar, Edit, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type ApplicationWithJob = Application & { job: Job };

const Applications = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithJob | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const { data: applications, isLoading, refetch } = useQuery<ApplicationWithJob[]>({
    queryKey: ['/api/applications', activeTab],
  });

  const handleUpdateStatus = async () => {
    if (!selectedApplication) return;

    try {
      await apiRequest("PATCH", `/api/applications/${selectedApplication.id}`, {
        status: statusUpdate,
        notes: notes
      });
      toast({
        title: "Status Updated",
        description: "Application status has been updated successfully."
      });
      setIsUpdateDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update application status.",
        variant: "destructive"
      });
    }
  };

  const openUpdateDialog = (application: ApplicationWithJob) => {
    setSelectedApplication(application);
    setStatusUpdate(application.status);
    setNotes(application.notes || "");
    setIsUpdateDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case JobStatus.APPLIED:
        return "bg-blue-100 text-blue-800";
      case JobStatus.IN_REVIEW:
        return "bg-yellow-100 text-yellow-800";
      case JobStatus.INTERVIEW:
        return "bg-green-100 text-green-800";
      case JobStatus.OFFERED:
        return "bg-purple-100 text-purple-800";
      case JobStatus.REJECTED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Prepare data for charts
  const getChartData = () => {
    if (!applications) return [];
    
    const statusCounts = {
      [JobStatus.APPLIED]: 0,
      [JobStatus.IN_REVIEW]: 0,
      [JobStatus.INTERVIEW]: 0,
      [JobStatus.OFFERED]: 0,
      [JobStatus.REJECTED]: 0,
    };
    
    applications.forEach(app => {
      statusCounts[app.status as keyof typeof statusCounts]++;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
      count
    }));
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900">Applications Tracker</h1>
        <p className="mt-1 text-sm text-gray-600">Track and manage all your job applications in one place.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Application Statistics</CardTitle>
              <CardDescription>Your application journey visualization</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : applications && applications.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-500">No application data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Quick overview of your applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-700">
                      {applications?.filter(a => a.status === JobStatus.APPLIED).length || 0}
                    </div>
                    <div className="text-xs text-blue-600">Applied</div>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-semibold text-yellow-700">
                      {applications?.filter(a => a.status === JobStatus.IN_REVIEW).length || 0}
                    </div>
                    <div className="text-xs text-yellow-600">In Review</div>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-700">
                      {applications?.filter(a => a.status === JobStatus.INTERVIEW).length || 0}
                    </div>
                    <div className="text-xs text-green-600">Interview</div>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <div className="text-lg font-semibold text-red-700">
                      {applications?.filter(a => a.status === JobStatus.REJECTED).length || 0}
                    </div>
                    <div className="text-xs text-red-600">Rejected</div>
                  </div>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg text-center">
                  <div className="text-lg font-semibold text-purple-700">
                    {applications?.filter(a => a.status === JobStatus.OFFERED).length || 0}
                  </div>
                  <div className="text-xs text-purple-600">Offers</div>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg text-center">
                  <div className="text-lg font-semibold text-gray-700">
                    {applications?.length || 0}
                  </div>
                  <div className="text-xs text-gray-600">Total Applications</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Applications List</CardTitle>
          <CardDescription>Manage all your job applications here</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value={JobStatus.APPLIED}>Applied</TabsTrigger>
              <TabsTrigger value={JobStatus.IN_REVIEW}>In Review</TabsTrigger>
              <TabsTrigger value={JobStatus.INTERVIEW}>Interview</TabsTrigger>
              <TabsTrigger value={JobStatus.OFFERED}>Offered</TabsTrigger>
              <TabsTrigger value={JobStatus.REJECTED}>Rejected</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : applications && applications.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell className="font-medium">{application.job.title}</TableCell>
                          <TableCell>{application.job.company}</TableCell>
                          <TableCell>{new Date(application.appliedDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(application.status)}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openUpdateDialog(application)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                asChild
                              >
                                <a href={application.job.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600">No applications found.</p>
                  <p className="text-sm text-gray-500 mt-1">Start applying to jobs to track your applications.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Update Application Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>
              Update the status and add notes for this application.
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <>
              <div className="grid gap-4 py-4">
                <div>
                  <h3 className="font-medium">{selectedApplication.job.title}</h3>
                  <p className="text-sm text-gray-500">{selectedApplication.job.company}</p>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Status:</div>
                  <div className="col-span-3">
                    <Select 
                      value={statusUpdate} 
                      onValueChange={setStatusUpdate}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={JobStatus.APPLIED}>Applied</SelectItem>
                        <SelectItem value={JobStatus.IN_REVIEW}>In Review</SelectItem>
                        <SelectItem value={JobStatus.INTERVIEW}>Interview</SelectItem>
                        <SelectItem value={JobStatus.OFFERED}>Offered</SelectItem>
                        <SelectItem value={JobStatus.REJECTED}>Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Applied:</div>
                  <div className="col-span-3">
                    {new Date(selectedApplication.appliedDate).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Notes:</div>
                  <div className="col-span-3">
                    <Textarea 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      placeholder="Add any notes about this application..." 
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateStatus}>
                  Update Status
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applications;
