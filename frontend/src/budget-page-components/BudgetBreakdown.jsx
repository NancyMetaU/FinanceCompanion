import { useState, useEffect } from "react";
import BudgetHeader from "./BudgetHeader";
import BudgetCard from "./BudgetCard";
import BudgetSummaryChart from "./BudgetSummaryChart";
import BudgetApproach from "./BudgetApproach";

const BudgetBreakdown = ({ budget }) => {
  const { income, buckets, priorities } = budget;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const budgetCards = [
    {
      title: "Needs",
      icon: "🏠",
      bucketData: buckets.needs,
      color: "text-blue-700",
      borderColor: "border-l-blue-800",
      gradientFrom: "from-blue-800",
      gradientTo: "to-blue-700",
    },
    {
      title: "Wants",
      icon: "🎯",
      bucketData: buckets.wants,
      color: "text-blue-700",
      borderColor: "border-l-blue-700",
      gradientFrom: "from-blue-700",
      gradientTo: "to-blue-600",
    },
    {
      title: "Savings",
      icon: "💰",
      bucketData: buckets.savings,
      color: "text-blue-700",
      borderColor: "border-l-blue-600",
      gradientFrom: "from-blue-600",
      gradientTo: "to-blue-500",
    },
  ];

  return (
    <section className="space-y-8 p-6 mb-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm">
      <BudgetHeader income={income} priorities={priorities} />

      <BudgetSummaryChart buckets={buckets} income={income} />

      <div className="grid gap-8 md:grid-cols-3">
        {budgetCards.map((card, index) => (
          <div
            key={card.title}
            className={`transform transition-all duration-700 ease-out h-full ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            <div className="h-full flex flex-col">
              <BudgetCard
                title={card.title}
                icon={card.icon}
                bucketData={card.bucketData}
                income={income}
                color={card.color}
                gradientFrom={card.gradientFrom}
                gradientTo={card.gradientTo}
              />
            </div>
          </div>
        ))}
      </div>

      <BudgetApproach />
    </section>
  );
};

export default BudgetBreakdown;
