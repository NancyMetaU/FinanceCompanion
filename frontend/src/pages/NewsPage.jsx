import { Link } from 'react-router-dom';

const NewsPage = () => {
    return (
      <div className="news-page">
        <h1>News Page</h1>
        <Link to="/" className="home-link">
        Go to Home
      </Link>
      </div>
    );
  };

  export default NewsPage;
