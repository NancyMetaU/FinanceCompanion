import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/lib/ui/card";

const TransactionList = ({ transactions }) => {
  const totalAmount = transactions
    .slice(0, 8)
    .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0)
    .toFixed(2);

  const getAmountColor = (amount) => {
    const value = parseFloat(amount);
    return value > 0 ? "text-red-500" : "text-green-500";
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card className="h-full shadow-sm hover:shadow transition-shadow">
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Recent Transactions</CardTitle>
          {transactions.length > 0 && (
            <span className="text-sm font-medium">
              Total:{" "}
              <span className={getAmountColor(totalAmount)}>
                ${totalAmount}
              </span>
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No transactions found.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Link your bank account to see your transactions here.
            </p>
          </div>
        ) : (
          <ul className="space-y-3 list-none p-0">
            {transactions.slice(0, 10).map((tx) => (
              <li
                key={tx.id}
                className="flex justify-between items-center p-3 rounded-md border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium truncate text-base m-0">
                    {tx.name}
                  </h3>
                  <time
                    dateTime={tx.date}
                    className="text-xs text-muted-foreground block"
                  >
                    {formatDate(tx.date)}
                  </time>
                </div>
                <div className="ml-4">
                  <span className={`font-medium ${getAmountColor(tx.amount)}`}>
                    ${Math.abs(parseFloat(tx.amount)).toFixed(2)}
                  </span>
                </div>
              </li>
            ))}

            {transactions.length > 8 && (
              <li className="text-center pt-2">
                <span className="text-xs text-muted-foreground">
                  + {transactions.length - 8} more transactions
                </span>
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
