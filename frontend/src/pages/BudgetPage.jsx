import { Link } from "react-router-dom";
import PlaidLinkButton from "../../budget-page-components/PlaidLinkButton";

const BudgetPage = () => {
  return (
    <div className="budget-page">
      <h1>Budget Page</h1>
      <PlaidLinkButton />
      <Link to="/" className="home-link">
        Go to Home
      </Link>
    </div>
  );
};

export default BudgetPage;
