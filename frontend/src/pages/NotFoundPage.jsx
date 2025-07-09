import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        Page Not Found
      </h2>
      <p className="text-gray-600 mb-8">
        Sorry, the page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="bg-royal hover:bg-blue-800 text-white px-6 py-3 rounded-lg"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
