import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: user } = useQuery<User | null>({
    queryKey: ['/api/user/current'],
  });

  const { data: notifications } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/count'],
  });

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-2xl font-bold text-primary cursor-pointer">JobFlow</span>
              </Link>
            </div>
            {/* Main Navigation */}
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <a className={`${location === '/' ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium`}>
                  Dashboard
                </a>
              </Link>
              <Link href="/job-board">
                <a className={`${location === '/job-board' ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium`}>
                  Job Board
                </a>
              </Link>
              <Link href="/applications">
                <a className={`${location === '/applications' ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium`}>
                  Applications
                </a>
              </Link>
              <Link href="/interview-prep">
                <a className={`${location === '/interview-prep' ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium`}>
                  Interview Prep
                </a>
              </Link>
              <Link href="/community">
                <a className={`${location === '/community' ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium`}>
                  Community
                </a>
              </Link>
            </nav>
          </div>

          {/* User Navigation */}
          <div className="flex items-center">
            <div className="relative">
              <Button variant="ghost" size="icon" className="p-2 rounded-full bg-gray-100 text-gray-500 hover:text-gray-600 focus:outline-none">
                <Bell className="h-5 w-5" />
                {notifications && notifications.count > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary text-xs font-medium text-white">
                    {notifications.count > 9 ? '9+' : notifications.count}
                  </span>
                )}
              </Button>
            </div>
            
            <div className="ml-3 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center text-sm rounded-full focus:outline-none">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User profile" />
                      <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                    <span className="ml-2 text-gray-700 hidden md:block">
                      {user?.username || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation menu */}
      <div className={`sm:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/">
            <a className={`${location === '/' ? 'bg-primary border-primary text-white' : 'border-transparent text-gray-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Dashboard
            </a>
          </Link>
          <Link href="/job-board">
            <a className={`${location === '/job-board' ? 'bg-primary border-primary text-white' : 'border-transparent text-gray-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Job Board
            </a>
          </Link>
          <Link href="/applications">
            <a className={`${location === '/applications' ? 'bg-primary border-primary text-white' : 'border-transparent text-gray-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Applications
            </a>
          </Link>
          <Link href="/interview-prep">
            <a className={`${location === '/interview-prep' ? 'bg-primary border-primary text-white' : 'border-transparent text-gray-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Interview Prep
            </a>
          </Link>
          <Link href="/community">
            <a className={`${location === '/community' ? 'bg-primary border-primary text-white' : 'border-transparent text-gray-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Community
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
