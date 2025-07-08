import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/lib/ui/card";

const TransactionList = ({ transactions }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No transactions found.
          </p>
        ) : (
          transactions.slice(0, 12).map((tx) => (
            <div key={tx.id} className="mb-4">
              <p className="font-medium">{tx.name}</p>
              <p className="text-sm text-muted-foreground">
                {tx.date} — ${tx.amount}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
