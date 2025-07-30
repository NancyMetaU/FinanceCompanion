import { Link, useLocation } from "react-router-dom";
import { Newspaper, Wallet, BookOpen, Home } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  return (
    <aside className="w-full md:w-42 bg-slate-100 border-r px-2 md:px-6 py-3 md:py-6">
      <nav className="flex flex-row md:flex-col justify-between md:justify-start md:space-y-4">
        <Link
          to="/"
          className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 p-1 sm:p-2 rounded-lg hover:text-royal"
        >
          <Home className="h-6 w-6" />
          <span className="font-medium text-xs sm:text-sm md:text-base">
            Home
          </span>
        </Link>
        <Link
          to="/budget"
          className={`flex items-center space-x-1 sm:space-x-2 md:space-x-3 p-1 sm:p-2 rounded-lg ${location.pathname === "/budget" ? "text-royal" : "hover:text-royal"
            }`}
        >
          <Wallet className="h-6 w-6" />
          <span className="font-medium text-xs sm:text-sm md:text-base">
            Budget
          </span>
        </Link>
        <Link
          to="/news"
          className={`flex items-center space-x-1 sm:space-x-2 md:space-x-3 p-1 sm:p-2 rounded-lg ${location.pathname === "/news" ? "text-royal" : "hover:text-royal"
            }`}
        >
          <Newspaper className="h-6 w-6" />
          <span className="font-medium text-xs sm:text-sm md:text-base">
            News
          </span>
        </Link>
        <Link
          to="/learning"
          className={`flex items-center space-x-1 sm:space-x-2 md:space-x-3 p-1 sm:p-2 rounded-lg ${location.pathname === "/learning"
              ? "text-royal"
              : "hover:text-royal"
            }`}
        >
          <BookOpen className="h-6 w-6" />
          <span className="font-medium text-xs sm:text-sm md:text-base">
            Learning
          </span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
