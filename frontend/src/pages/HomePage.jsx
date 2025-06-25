import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-page">
      <h1>Home Page</h1>
      <Link
        to={'/budget'}
      >
        Budget
      </Link>
      <Link
        to={'/learning'}
      >
        Learning
      </Link>
      <Link
        to={'/news'}
      >
        News
      </Link>
    </div>
  );
};

export default HomePage;
