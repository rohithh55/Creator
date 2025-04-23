import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, X, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Custom link component to avoid nesting <a> tags
const NavLink = ({ href, children, className }: { href: string, children: React.ReactNode, className: string }) => {
  const [, navigate] = useLocation();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };
  
  return (
    <div className={`${className} cursor-pointer`} onClick={handleClick}>
      {children}
    </div>
  );
};

const Header = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, isAuthorized, logoutMutation } = useAuth();

  const { data: notifications } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/count'],
    enabled: isAuthorized,
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-2xl font-bold text-primary cursor-pointer">AWS JobFlow</span>
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden ml-auto">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMobileMenu}
                className="p-2 rounded-full text-gray-500"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
            
            {/* Main Navigation - Desktop */}
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {isAuthorized && (
                <>
                  <NavLink 
                    href="/"
                    className={`${location === '/' ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium`}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink 
                    href="/job-board"
                    className={`${location === '/job-board' ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium`}
                  >
                    Job Board
                  </NavLink>
                  <NavLink 
                    href="/applications"
                    className={`${location === '/applications' ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium`}
                  >
                    Applications
                  </NavLink>
                  <NavLink 
                    href="/interview-prep"
                    className={`${location === '/interview-prep' ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium`}
                  >
                    Interview Prep
                  </NavLink>
                  <NavLink 
                    href="/community"
                    className={`${location === '/community' ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium`}
                  >
                    Community
                  </NavLink>
                </>
              )}
            </nav>
          </div>

          {/* User Navigation - Desktop */}
          <div className="hidden sm:flex items-center">
            {isAuthorized ? (
              <>
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
                          <AvatarFallback>{user?.username?.slice(0, 2).toUpperCase() || "UN"}</AvatarFallback>
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
                      <DropdownMenuItem onClick={handleLogout}>
                        {logoutMutation.isPending ? "Logging out..." : "Logout"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <Button asChild variant="default" className="ml-4">
                <Link href="/auth">
                  <div className="flex items-center">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login / Register
                  </div>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation menu */}
      <div className={`sm:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          {isAuthorized ? (
            <>
              <NavLink 
                href="/"
                className={`${location === '/' ? 'bg-primary border-primary text-white' : 'border-transparent text-gray-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                Dashboard
              </NavLink>
              <NavLink 
                href="/job-board"
                className={`${location === '/job-board' ? 'bg-primary border-primary text-white' : 'border-transparent text-gray-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                Job Board
              </NavLink>
              <NavLink 
                href="/applications"
                className={`${location === '/applications' ? 'bg-primary border-primary text-white' : 'border-transparent text-gray-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                Applications
              </NavLink>
              <NavLink 
                href="/interview-prep"
                className={`${location === '/interview-prep' ? 'bg-primary border-primary text-white' : 'border-transparent text-gray-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                Interview Prep
              </NavLink>
              <NavLink 
                href="/community"
                className={`${location === '/community' ? 'bg-primary border-primary text-white' : 'border-transparent text-gray-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                Community
              </NavLink>
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User profile" />
                      <AvatarFallback>{user?.username?.slice(0, 2).toUpperCase() || "UN"}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user?.username}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <NavLink 
                    href="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Profile
                  </NavLink>
                  <NavLink 
                    href="/settings"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Settings
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <NavLink
              href="/auth"
              className="flex items-center px-4 py-2 text-base font-medium text-primary"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Login / Register
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
