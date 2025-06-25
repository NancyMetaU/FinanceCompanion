import { Link } from 'react-router-dom';

const LearningPage = () => {
    return (
      <div className="learning-page">
        <h1>Learning Page</h1>
        <Link to="/" className="home-link">
        Go to Home
      </Link>
      </div>
    );
  };

  export default LearningPage;
