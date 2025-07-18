import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import Header from "../shared-components/Header";
import Footer from "../shared-components/Footer";
import Sidebar from "../shared-components/Sidebar";
import PlaidLinkButton from "../budget-page-components/PlaidLinkButton";
import BankAccountList from "../budget-page-components/BankAccountList";
import TransactionList from "../budget-page-components/TransactionList";
import CreateBudgetButton from "../budget-page-components/CreateBudgetButton";
import BudgetBreakdown from "../budget-page-components/BudgetBreakdown";
import Loading from "../shared-components/Loading";
import ErrorMessage from "../shared-components/ErrorMessage";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const BudgetPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hasBankLinked = accounts.length > 0;

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error("User not authenticated");

      const idToken = await user.getIdToken();

      const [accRes, txRes, budgetRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/accounts/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }),
        fetch(`${BACKEND_URL}/api/transactions/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }),
        fetch(`${BACKEND_URL}/api/budget/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }),
      ]);

      if (!accRes.ok || !txRes.ok) {
        throw new Error("Failed to fetch account or transaction data");
      }

      const accountsData = await accRes.json();
      const transactionsData = await txRes.json();

      setAccounts(accountsData);
      setTransactions(transactionsData);

      if (budgetRes.ok) {
        const budgetData = await budgetRes.json();
        setBudget(budgetData.budgetData);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Data fetching failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBankLinked = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6">
          <section className="flex justify-between items-center mt-5 mb-10">
            <h1 className="text-3xl font-bold">My Budget Dashboard</h1>
            {!hasBankLinked && (
              <PlaidLinkButton onBankLinked={handleBankLinked} />
            )}
          </section>

          {loading && <Loading message="Fetching your financial data..." />}
          {error && <ErrorMessage message={error} />}

          {!loading && !error && (
            <>
              <section className="grid gap-8 lg:grid-cols-2 mb-10">
                <BankAccountList accounts={accounts} />
                <TransactionList transactions={transactions} />
              </section>
              {budget && (
                <section className="mt-10">
                  <BudgetBreakdown budget={budget} />
                </section>
              )}
              <section className="flex justify-center mt-10">
                <CreateBudgetButton
                  onBudgetGenerated={setBudget}
                  hasBudget={!!budget}
                />
              </section>
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default BudgetPage;
