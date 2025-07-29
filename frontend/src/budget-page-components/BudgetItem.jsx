import ProgressBar from "./ProgressBar";

const formatCurrency = (amount) =>
  `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatPercentage = (amount, total) =>
  `${((amount / total) * 100).toFixed(1)}%`;

const BudgetItem = ({
  label,
  amount,
  total,
  isSubItem = false,
  color = "text-gray-700",
  progressBarColor = "bg-blue-500",
  showPercentage = true,
  showProgressBar = true,
}) => {
  const percentage = (amount / total) * 100;

  return (
    <li
      className={`${isSubItem ? "ml-4 py-1" : "py-2"
        } border-b border-gray-100 last:border-b-0 list-none`}
    >
      <div className="flex justify-between items-center">
        <span
          className={`${isSubItem ? "text-sm text-gray-600" : "font-medium"
            } ${color}`}
        >
          {label}
        </span>
        <div className="text-right">
          <span
            className={`${isSubItem ? "text-sm" : "font-semibold"} ${color}`}
          >
            {formatCurrency(amount)}
          </span>
          {!isSubItem && showPercentage && (
            <div className="text-xs text-gray-500 mt-1">
              {formatPercentage(amount, total)} of income
            </div>
          )}
        </div>
      </div>
      {!isSubItem && showProgressBar && (
        <ProgressBar percentage={percentage} color={progressBarColor} />
      )}
    </li>
  );
};

export default BudgetItem;
