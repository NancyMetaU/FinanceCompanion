import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import Header from "../shared-components/Header";
import Sidebar from "../shared-components/Sidebar";
import PlaidLinkButton from "../budget-page-components/PlaidLinkButton";
import BankAccountList from "../budget-page-components/BankAccountList";
import TransactionList from "../budget-page-components/TransactionList";
import CreateBudgetButton from "../budget-page-components/CreateBudgetButton";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const BudgetPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const user = getAuth().currentUser;
      if (!user) return;

      const idToken = await user.getIdToken();

      const res = await fetch(`${BACKEND_URL}/api/accounts/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await res.json();
      setAccounts(data);
    };

    fetchAccounts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-10">My Budget Dashboard</h1>

          <div className="mb-10">
            <PlaidLinkButton />
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <BankAccountList accounts={accounts} />
            <TransactionList transactions={transactions} />
          </div>

          <div className="mt-10">
            <CreateBudgetButton />
          </div>

          <Link
            to="/"
            className="mt-10 inline-block text-blue-600 hover:underline"
          >
            Go to Home
          </Link>
        </main>
      </div>
    </div>
  );
};

export default BudgetPage;
