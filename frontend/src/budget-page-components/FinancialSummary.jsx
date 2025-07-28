import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/ui/card";

const FinancialSummary = ({
    totalBalance,
    accountsCount,
    recentTransactionsTotal,
    budgetStatus,
}) => {
    return (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="bg-white shadow-sm hover:shadow transition-shadow">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">
                        Total Balance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">${totalBalance}</p>
                </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow transition-shadow">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">
                        Accounts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{accountsCount}</p>
                </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow transition-shadow">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">
                        Recent Transactions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">${recentTransactionsTotal}</p>
                </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow transition-shadow">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">
                        Budget Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">
                        {budgetStatus ? "Active" : "Not Set"}
                    </p>
                </CardContent>
            </Card>
        </section>
    );
};

export default FinancialSummary;
