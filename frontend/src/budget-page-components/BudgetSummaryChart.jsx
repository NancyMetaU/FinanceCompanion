import { useState, useEffect } from "react";

const BudgetSummaryChart = ({ buckets, income }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const needsPercentage = Math.round((buckets.needs.total / income) * 100);
  const wantsPercentage = Math.round((buckets.wants.total / income) * 100);
  const savingsPercentage = Math.round((buckets.savings.total / income) * 100);

  return (
    <section className="bg-white p-6 rounded-lg shadow-md">
      <h3
        id="budget-distribution-title"
        className="text-lg font-semibold mb-4 text-gray-800"
      >
        Budget Distribution
      </h3>

      <figure className="m-0">
        <div
          className="chart-container flex h-8 w-full rounded-full overflow-hidden"
          role="img"
        >
          <span
            className="bg-blue-700 h-full transition-all duration-1000 ease-out"
            style={{
              width: `${needsPercentage}%`,
              transform: isVisible ? "scaleX(1)" : "scaleX(0)",
            }}
          ></span>
          <span
            className="bg-blue-600 h-full transition-all duration-1000 ease-out delay-100"
            style={{
              width: `${wantsPercentage}%`,
              transform: isVisible ? "scaleX(1)" : "scaleX(0)",
            }}
          ></span>
          <span
            className="bg-blue-500 h-full transition-all duration-1000 ease-out delay-200"
            style={{
              width: `${savingsPercentage}%`,
              transform: isVisible ? "scaleX(1)" : "scaleX(0)",
            }}
          ></span>
        </div>

        <figcaption>
          <ul className="flex justify-between mt-2 text-sm list-none p-0">
            <li className="flex items-center">
              <span className="w-3 h-3 bg-blue-700 rounded-full inline-block mr-2"></span>
              <span>Needs: {needsPercentage}%</span>
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-blue-600 rounded-full inline-block mr-2"></span>
              <span>Wants: {wantsPercentage}%</span>
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full inline-block mr-2"></span>
              <span>Savings: {savingsPercentage}%</span>
            </li>
          </ul>
        </figcaption>
      </figure>
    </section>
  );
};

export default BudgetSummaryChart;
