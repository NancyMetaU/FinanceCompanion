import { Tooltip, TooltipTrigger, TooltipContent } from "@/lib/ui/tooltip";
import { Info } from "lucide-react";

const RecurringTransactionsTooltip = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const totalAmount = transactions.reduce((sum, txn) => sum + txn.amount, 0);

  return (
    <Tooltip>
      <TooltipTrigger>
        <Info className="h-4 w-4 text-blue-500 cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="bg-blue-600 text-white p-3 rounded-md border border-blue-500/20 shadow-lg max-w-xs">
        <div className="text-xs space-y-1">
          <p className="font-semibold mb-2">Recurring Transactions</p>
          <div className="max-h-60 overflow-y-auto">
            {transactions.map((transaction, index) => (
              <p key={transaction.id || index} className="flex justify-between">
                <span>{capitalizeFirstLetter(transaction.name)}:</span>
                <span className="font-semibold">
                  $
                  {transaction.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </p>
            ))}
          </div>
          <hr className="my-2 border-white/20" />
          <p className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>
              $
              {totalAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default RecurringTransactionsTooltip;
