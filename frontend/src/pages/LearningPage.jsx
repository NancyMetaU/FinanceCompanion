import { Link } from "react-router-dom";

/**
 * NOTE: This page was meant for clickable cards on financial topics that may be
 * implemented at a later time. It is not required for any TCs or final project.
 * Considering removing this page for the final demo if time constraints don't
 * allow for implementation.
 */

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
