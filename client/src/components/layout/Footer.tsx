import { Link } from 'wouter';

const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <span className="text-sm text-gray-500">© {new Date().getFullYear()} JobFlow. All rights reserved.</span>
          </div>
          <div>
            <ul className="flex space-x-6">
              <li>
                <Link href="/help">
                  <a className="text-sm text-gray-500 hover:text-gray-900">Help</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="text-sm text-gray-500 hover:text-gray-900">Privacy</a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-sm text-gray-500 hover:text-gray-900">Terms</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
