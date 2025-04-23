import { Link, useLocation } from 'wouter';

// Custom link component to avoid nesting <a> tags
const FooterLink = ({ href, children, className }: { href: string, children: React.ReactNode, className: string }) => {
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

const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <span className="text-sm text-gray-500">© {new Date().getFullYear()} AWS JobFlow. All rights reserved.</span>
          </div>
          <div>
            <ul className="flex space-x-6">
              <li>
                <FooterLink 
                  href="/help"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Help
                </FooterLink>
              </li>
              <li>
                <FooterLink 
                  href="/privacy"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Privacy
                </FooterLink>
              </li>
              <li>
                <FooterLink 
                  href="/terms"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Terms
                </FooterLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
