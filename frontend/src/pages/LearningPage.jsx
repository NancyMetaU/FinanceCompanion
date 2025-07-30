import React from "react";
import Header from "../shared-components/Header";
import Footer from "../shared-components/Footer";
import Sidebar from "../shared-components/Sidebar";
import ExpandableModule from "../learning-page-components/ExpandableModule";

const LearningPage = () => {
  const financialModules = [
    {
      title: "Financial Basics",
      concepts: [
        {
          title: "Budgeting Basics",
          description:
            "A budget is a simple plan for your money that helps you track what comes in and what goes out. It shows you how much you can spend on things you need, save for the future, and use to pay off any debts. Making a budget helps you stay in control of your money and reach your financial goals.",
          link: "https://www.nerdwallet.com/article/finance/how-to-budget",
          linkText: "Budgeting Guide",
        },
        {
          title: "Emergency Funds",
          description:
            "An emergency fund is money you save for unexpected situations like car repairs, medical bills, or job loss. It's like a financial safety net that helps you avoid going into debt when surprises happen. Most experts suggest saving enough to cover 3-6 months of your basic living costs like rent, food, and utilities.",
          link: "https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/",
          linkText: "Emergency Fund Guide",
        },
      ],
    },
    {
      title: "Investing",
      concepts: [
        {
          title: "Investment Fundamentals",
          description:
            "Investing means putting your money to work to help it grow over time. It's like planting seeds that can grow into more money in the future. Common ways to invest include: stocks (owning a small piece of a company), bonds (lending money to companies or the government), ETFs (baskets of different investments), and mutual funds (collections of investments managed by experts).",
          link: "https://www.investor.gov/introduction-investing",
          linkText: "Investment Basics",
        },
        {
          title: "Sustainable Investing",
          description:
            "Sustainable investing means putting your money into companies that care about the planet, treat people well, and are run honestly. It's also called ESG investing (Environmental, Social, and Governance). This approach lets you grow your money while supporting businesses that make positive changes in the world and avoiding those that cause harm.",
          link: "https://online.hbs.edu/blog/post/sustainable-investing",
          linkText: "ESG Investing",
        },
      ],
    },
    {
      title: "Financial Planning",
      concepts: [
        {
          title: "Retirement Planning",
          description:
            "Retirement planning is preparing for life after you stop working. It involves figuring out how much money you'll need, where that money will come from, and how to save enough to live comfortably. This includes setting up retirement accounts, estimating your future expenses, creating a savings plan, and making smart choices with your money along the way.",
          link: "https://www.ssa.gov/planners/retire/",
          linkText: "Retirement Resources",
        },
        {
          title: "Estate Planning",
          description:
            "Estate planning is deciding what happens to your belongings and money after you're gone. It helps make sure your wishes are followed and your loved ones are taken care of. Important parts include: a will (instructions for your belongings), trusts (special arrangements for managing assets), power of attorney (someone to make decisions if you can't), and healthcare directives (your medical care wishes).",
          link: "https://www.kiplinger.com/personal-finance/the-basics-of-estate-planning",
          linkText: "Estate Planning Basics",
        },
        {
          title: "Financial Independence",
          description:
            "Financial independence means having enough money to cover your living expenses without needing to work. It's about having the freedom to make life choices without worrying about how to pay the bills. The FIRE movement (Financial Independence, Retire Early) is about saving and investing a large portion of your income so you can stop working much earlier than the traditional retirement age.",
          link: "https://www.investopedia.com/terms/f/financial-independence-retire-early-fire.asp",
          linkText: "FIRE Movement",
        },
      ],
    },
    {
      title: "Credit & Debt",
      concepts: [
        {
          title: "Credit Score Optimization",
          description:
            "Your credit score is a number between 300-850 that tells lenders how reliable you are with money. Higher scores help you get better loans with lower interest rates. Your score is based on: whether you pay bills on time, how much of your available credit you're using, how long you've had credit, the mix of credit types you have, and how often you apply for new credit.",
          link: "https://www.creditkarma.com/",
          linkText: "Check Your Credit",
        },
        {
          title: "Debt Management",
          description:
            "Debt management is about taking control of what you owe and creating a plan to pay it off. It involves understanding your different debts (like mortgages, car loans, credit cards, and student loans), knowing their interest rates, and choosing the best way to pay them off. Popular strategies include the debt avalanche (paying highest interest first) and debt snowball (paying smallest debts first for quick wins).",
          link: "https://www.consumerfinance.gov/consumer-tools/debt-collection/",
          linkText: "Debt Resources",
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <Header />

      <div className="flex flex-col md:flex-row flex-1">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8">
          <section className="flex justify-between items-center mt-5 mb-7">
            <h1 className="text-3xl font-bold">Financial Learning</h1>
          </section>

          <div className="mb-8">
            <p className="text-gray-600 max-w-3xl">
              Explore these financial concepts organized by topic. Click on a
              module to expand it.
            </p>
          </div>

          <div className="space-y-6">
            {financialModules.map((module) => (
              <ExpandableModule
                title={module.title}
                concepts={module.concepts}
              />
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default LearningPage;
