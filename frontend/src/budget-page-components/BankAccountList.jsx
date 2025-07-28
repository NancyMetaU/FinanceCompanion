import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/lib/ui/card";

const BankAccountList = ({ accounts }) => {
  const totalBalance = accounts
    .reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0)
    .toFixed(2);

  const getAccountTypeStyles = (type) => {
    const typeLC = type?.toLowerCase() || "";

    if (typeLC.includes("depository")) {
      return { color: "text-blue-500", label: "Depository" };
    } else if (typeLC.includes("credit")) {
      return { color: "text-purple-500", label: "Credit" };
    } else if (typeLC.includes("loan")) {
      return { color: "text-orange-500", label: "Loan" };
    } else if (typeLC.includes("investment")) {
      return { color: "text-amber-500", label: "Investment" };
    } else {
      return { color: "text-gray-500", label: type || "Account" };
    }
  };

  // Format currency values
  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  return (
    <Card className="h-full shadow-sm hover:shadow transition-shadow">
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Connected Accounts</CardTitle>
          {accounts.length > 0 && (
            <span className="text-sm font-medium">
              Total: <span className="text-blue-600">${totalBalance}</span>
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No accounts linked yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Connect your bank account to see your balances here.
            </p>
          </div>
        ) : (
          <ul className="space-y-3 list-none p-0">
            {accounts.map((acc) => {
              const { color, label } = getAccountTypeStyles(acc.type);
              return (
                <li
                  key={acc.id}
                  className="p-3 rounded-md border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-base m-0">{acc.name}</h3>
                    <span className="font-semibold">
                      ${formatCurrency(acc.balance)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className={`text-xs ${color} font-medium`}>
                      {label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {acc.institution || "Bank Account"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default BankAccountList;
