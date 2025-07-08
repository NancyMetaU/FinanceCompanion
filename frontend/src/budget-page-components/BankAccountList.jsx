import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/lib/ui/card";

const BankAccountList = ({ accounts }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No accounts linked yet.
          </p>
        ) : (
          accounts.map((acc) => (
            <div key={acc.id} className="mb-4">
              <p className="font-medium">
                {acc.name} — {acc.type}
              </p>
              <p className="text-sm text-muted-foreground">
                Balance: ${acc.balance}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default BankAccountList;
