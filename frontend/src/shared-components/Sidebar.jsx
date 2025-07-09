import { Link, useLocation } from "react-router-dom";
import { Newspaper, Wallet, BookOpen, Home } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  return (
    <aside className="w-42 bg-slate-100 border-r px-6 py-6">
      <nav className="flex flex-col space-y-4">
        <Link
          to="/"
          className="flex items-center space-x-3 p-2 rounded-lg hover:text-royal"
        >
          <Home className="h-6 w-6" />
          <span className="font-medium">Home</span>
        </Link>
        <Link
          to="/budget"
          className={`flex items-center space-x-3 p-2 rounded-lg ${
            location.pathname === "/budget" ? "text-royal" : "hover:text-royal"
          }`}
        >
          <Wallet className="h-6 w-6" />
          <span className="font-medium">Budget</span>
        </Link>
        <Link
          to="/news"
          className={`flex items-center space-x-3 p-2 rounded-lg ${
            location.pathname === "/news" ? "text-royal" : "hover:text-royal"
          }`}
        >
          <Newspaper className="h-6 w-6" />
          <span className="font-medium">News</span>
        </Link>
        <Link
          to="/learning"
          className={`flex items-center space-x-3 p-2 rounded-lg ${
            location.pathname === "/learning" ? "text-royal" : "hover:text-royal"
          }`}
        >
          <BookOpen className="h-6 w-6" />
          <span className="font-medium">Learning</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
