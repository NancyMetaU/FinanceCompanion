import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <h1>Page Not Found</h1>
      <p>Sorry, the page you’re looking for doesn’t exist.</p>
      <Link to="/" className="home-link">
        Go to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
