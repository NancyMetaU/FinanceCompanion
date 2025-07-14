import BudgetHeader from "./BudgetHeader";
import BudgetCard from "./BudgetCard";

const BudgetBreakdown = ({ budget }) => {
  const { income, buckets, warning, priorities } = budget;

  const budgetCards = [
    {
      title: "Needs",
      icon: "🏠",
      bucketData: buckets.needs,
      color: "text-blue-800",
      borderColor: "border-l-blue-800",
      gradientFrom: "from-blue-900",
      gradientTo: "to-blue-800",
    },
    {
      title: "Wants",
      icon: "🎯",
      bucketData: buckets.wants,
      color: "text-blue-600",
      borderColor: "border-l-blue-500",
      gradientFrom: "from-blue-600",
      gradientTo: "to-blue-500",
    },
    {
      title: "Savings",
      icon: "💰",
      bucketData: buckets.savings,
      color: "text-blue-500",
      borderColor: "border-l-blue-300",
      gradientFrom: "from-blue-400",
      gradientTo: "to-blue-300",
    },
  ];

  return (
    <section className="space-y-8">
      <BudgetHeader income={income} priorities={priorities} />

      <div className="grid gap-8 md:grid-cols-3">
        {budgetCards.map((card) => (
          <BudgetCard
            key={card.title}
            title={card.title}
            icon={card.icon}
            bucketData={card.bucketData}
            income={income}
            color={card.color}
            borderColor={card.borderColor}
            gradientFrom={card.gradientFrom}
            gradientTo={card.gradientTo}
          />
        ))}
      </div>

      {warning && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-red-700">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">{warning}</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default BudgetBreakdown;
