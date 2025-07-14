import PriorityBadge from "./PriorityBadge";

const formatCurrency = (amount) =>
  `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const BudgetHeader = ({ income, priorities }) => {
  return (
    <header className="text-center">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-800 via-blue-600 to-blue-400 bg-clip-text text-transparent">
        Your Monthly Budget
      </h2>
      <p className="text-gray-600 mt-2 text-lg">
        Based on an income of{" "}
        <span className="font-semibold text-blue-600">
          {formatCurrency(income)}
        </span>
      </p>
      {priorities && (
        <div className="flex justify-center gap-3 mt-4">
          {priorities.savings && (
            <PriorityBadge priority={priorities.savings} type="Savings" />
          )}
          {priorities.debt && (
            <PriorityBadge priority={priorities.debt} type="Debt" />
          )}
        </div>
      )}
    </header>
  );
};

export default BudgetHeader;
