import { JobSource, InsertJob } from "@shared/schema";

/**
 * JobScraperService handles scraping job listings from various job boards
 * 
 * In a real production application, this would use proper web scraping techniques or APIs
 * For this implementation, we'll create a simplified version that generates mock job data
 */
export class JobScraperService {
  /**
   * Extracts the name of the job source from its URL
   * @param {string} url The URL of the job source
   * @returns {string} The name of the job source
   */
  getSourceNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Extract domain name without TLD
      const domain = urlObj.hostname.replace('www.', '').split('.')[0];
      
      // Capitalize first letter
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch (error) {
      // If URL parsing fails, return the original URL
      return url;
    }
  }

  /**
   * Scrapes job listings from a given job source
   * @param {JobSource} source The job source to scrape
   * @returns {Promise<InsertJob[]>} A list of jobs scraped from the source
   */
  async scrapeJobs(source: JobSource): Promise<InsertJob[]> {
    try {
      // In a real app, this would perform web scraping or API calls
      // For this implementation, we'll generate some mock jobs based on the source
      
      // Different jobs based on the source
      switch (this.getSourceNameFromUrl(source.url).toLowerCase()) {
        case 'linkedin':
          return this.generateLinkedInJobs(source.id);
        case 'indeed':
          return this.generateIndeedJobs(source.id);
        case 'glassdoor':
          return this.generateGlassdoorJobs(source.id);
        default:
          return this.generateGenericJobs(source.id);
      }
    } catch (error) {
      console.error(`Error scraping jobs from ${source.url}:`, error);
      throw new Error(`Failed to scrape jobs from ${source.name}`);
    }
  }

  /**
   * Generates mock LinkedIn jobs
   */
  private generateLinkedInJobs(sourceId: number): InsertJob[] {
    return [
      {
        title: "Junior React Developer",
        company: "TechStart",
        location: "Bangalore, India (Remote)",
        jobType: "Full-time",
        description: "Great opportunity for freshers to learn React and modern frontend development practices in a fast-paced startup environment.",
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
        url: "https://linkedin.com/jobs/view/junior-react-developer",
        sourceId,
        isEasyApply: true,
        isFresher: true,
        isInternship: false
      },
      {
        title: "Data Science Intern",
        company: "Analytics Hub",
        location: "Remote",
        jobType: "Internship (3 months)",
        description: "Looking for students or recent graduates interested in data science. You'll work with real data sets and learn machine learning techniques.",
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000),
        url: "https://linkedin.com/jobs/view/data-science-intern",
        sourceId,
        isEasyApply: true,
        isFresher: true,
        isInternship: true
      },
      {
        title: "Graduate Software Engineer",
        company: "Infosys",
        location: "Hyderabad, India",
        jobType: "Full-time",
        description: "Entry-level role for engineering graduates. Training provided in full-stack development with Java and React.",
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000),
        url: "https://linkedin.com/jobs/view/graduate-software-engineer",
        sourceId,
        isEasyApply: true,
        isFresher: true,
        isInternship: false
      },
      {
        title: "AWS Cloud Engineer (Entry Level)",
        company: "CloudTech Solutions",
        location: "Mumbai, India (Hybrid)",
        jobType: "Full-time",
        description: "Seeking a junior cloud engineer to help manage AWS infrastructure. Knowledge of EC2, S3, RDS, IAM, and VPC is preferred. Great opportunity for AWS certification.",
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000),
        url: "https://linkedin.com/jobs/view/aws-cloud-engineer-entry-level",
        sourceId,
        isEasyApply: true,
        isFresher: true,
        isInternship: false
      },
      {
        title: "DevOps Engineer Intern",
        company: "TechSystems Inc",
        location: "Bangalore, India",
        jobType: "Internship (6 months)",
        description: "Join our DevOps team to learn CI/CD pipelines, Kubernetes, and Terraform. You'll work with experienced engineers to automate infrastructure deployment and application delivery.",
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 2) * 24 * 60 * 60 * 1000),
        url: "https://linkedin.com/jobs/view/devops-engineer-intern",
        sourceId,
        isEasyApply: true,
        isFresher: true,
        isInternship: true
      },
      {
        title: "Python Developer - AWS Integration",
        company: "DataSystems Ltd",
        location: "Delhi, India (Remote)",
        jobType: "Full-time",
        description: "Looking for Python developers to work on AWS Lambda functions, DynamoDB integration, and other serverless applications. Experience with Python frameworks and AWS SDK is a plus.",
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
        url: "https://linkedin.com/jobs/view/python-developer-aws-integration",
        sourceId,
        isEasyApply: true,
        isFresher: false,
        isInternship: false
      }
    ];
  }

  /**
   * Generates mock Indeed jobs
   */
  private generateIndeedJobs(sourceId: number): InsertJob[] {
    return [
      {
        title: "Frontend Development Trainee",
        company: "WebGenius",
        location: "Pune, India",
        jobType: "Full-time",
        description: "6-month training program for freshers in HTML, CSS, JavaScript, and React. Successful candidates will join our development team.",
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 8) * 24 * 60 * 60 * 1000),
        url: "https://indeed.com/jobs/frontend-development-trainee",
        sourceId,
        isEasyApply: false,
        isFresher: true,
        isInternship: false
      },
      {
        title: "Junior QA Engineer",
        company: "TestMaster",
        location: "Chennai, India",
        jobType: "Full-time",
        description: "Looking for detail-oriented freshers to join our quality assurance team. Will train on manual and automated testing processes.",
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 12) * 24 * 60 * 60 * 1000),
        url: "https://indeed.com/jobs/junior-qa-engineer",
        sourceId,
        isEasyApply: false,
        isFresher: true,
        isInternship: false
      },
      {
        title: "Marketing Intern",
        company: "GrowthHackers",
        location: "Mumbai, India (Hybrid)",
        jobType: "Internship (6 months)",
        description: "Join our marketing team to learn digital marketing, SEO, and social media strategy. Stipend provided.",
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000),
        url: "https://indeed.com/jobs/marketing-intern",
        sourceId,
        isEasyApply: false,
        isFresher: true,
        isInternship: true
      },
      {
        title: "Terraform Infrastructure Engineer",
        company: "InfraTech Solutions",
        location: "Hyderabad, India",
        jobType: "Full-time",
        description: "Looking for a Terraform expert to help manage our infrastructure as code. Experience with AWS, VPC, IAM, and EC2 is required. You'll be working on automating cloud infrastructure deployments.",
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 4) * 24 * 60 * 60 * 1000),
        url: "https://indeed.com/jobs/terraform-infrastructure-engineer",
        sourceId,
        isEasyApply: false,
        isFresher: false,
        isInternship: false
      },
      {
        title: "AWS S3 & RDS Specialist",
        company: "DataCloud Engineering",
        location: "Pune, India (Remote)",
        jobType: "Full-time",
        description: "Seeking an AWS specialist with deep knowledge of S3, RDS, and data migration techniques. You will be responsible for designing and implementing secure and scalable data storage solutions on AWS.",
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 6) * 24 * 60 * 60 * 1000),
        url: "https://indeed.com/jobs/aws-s3-rds-specialist",
        sourceId,
        isEasyApply: false,
        isFresher: false,
        isInternship: false
      },
      {
        title: "Junior Kubernetes Administrator",
        company: "ContainerTech",
        location: "Bangalore, India",
        jobType: "Full-time",
        description: "Entry-level position for Kubernetes enthusiasts. You'll learn to manage EKS clusters, deploy applications, and implement CI/CD pipelines. Great opportunity to grow your container orchestration skills.",
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 2) * 24 * 60 * 60 * 1000),
        url: "https://indeed.com/jobs/junior-kubernetes-administrator",
        sourceId,
        isEasyApply: false,
        isFresher: true,
        isInternship: false
      }
    ];
  }

  /**
   * Generates mock Glassdoor jobs
   */
  private generateGlassdoorJobs(sourceId: number): InsertJob[] {
    return [
      {
        title: "Entry Level Python Developer",
        company: "DataCraft",
        location: "Delhi NCR, India",
        jobType: "Full-time",
        description: "Great opportunity for freshers with knowledge of Python. You'll work on data processing pipelines and backend services.",
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 6) * 24 * 60 * 60 * 1000),
        url: "https://glassdoor.com/jobs/entry-level-python-developer",
        sourceId,
        isEasyApply: false,
        isFresher: true,
        isInternship: false
      },
      {
        title: "UI/UX Design Intern",
        company: "DesignLabs",
        location: "Bangalore, India",
        jobType: "Internship (4 months)",
        description: "Learn UI/UX design principles and tools including Figma and Adobe XD. Portfolio development opportunity.",
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 9) * 24 * 60 * 60 * 1000),
        url: "https://glassdoor.com/jobs/ui-ux-design-intern",
        sourceId,
        isEasyApply: false,
        isFresher: true,
        isInternship: true
      },
      {
        title: "Associate Cloud Engineer",
        company: "CloudNative",
        location: "Gurgaon, India",
        jobType: "Full-time",
        description: "Entry-level role for graduates interested in cloud technologies. Training provided on AWS, Azure, and GCP.",
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000),
        url: "https://glassdoor.com/jobs/associate-cloud-engineer",
        sourceId,
        isEasyApply: false,
        isFresher: true,
        isInternship: false
      }
    ];
  }

  /**
   * Generates generic mock jobs for other sources
   */
  private generateGenericJobs(sourceId: number): InsertJob[] {
    return [
      {
        title: "Graduate Software Developer",
        company: "Tech Solutions",
        location: "Remote",
        jobType: "Full-time",
        description: "Entry-level software development role. Great learning opportunity for fresh graduates with programming knowledge.",
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 11) * 24 * 60 * 60 * 1000),
        url: "https://example.com/jobs/graduate-software-developer",
        sourceId,
        isEasyApply: false,
        isFresher: true,
        isInternship: false
      },
      {
        title: "Business Analyst Intern",
        company: "ConsultCorp",
        location: "Mumbai, India",
        jobType: "Internship (3 months)",
        description: "Business analysis internship for students or recent graduates. Learn data analysis and business process modeling.",
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
        url: "https://example.com/jobs/business-analyst-intern",
        sourceId,
        isEasyApply: false,
        isFresher: true,
        isInternship: true
      }
    ];
  }
}
