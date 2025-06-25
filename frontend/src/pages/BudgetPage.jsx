import { Link } from 'react-router-dom';

const BudgetPage = () => {
    return (
      <div className="budget-page">
        <h1>Budget Page</h1>
        <Link to="/" className="home-link">
        Go to Home
      </Link>
      </div>
    );
  };

  export default BudgetPage;
