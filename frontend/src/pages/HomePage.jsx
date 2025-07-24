import React from "react";
import Header from "../shared-components/Header";
import Footer from "../shared-components/Footer";
import TopSection from "../home-page-components/TopSection";
import QuoteSection from "../home-page-components/QuoteSection";
import FeatureSection from "../home-page-components/FeatureSection";
import CallToAction from "../home-page-components/CallToAction";

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />
      <main className="flex-grow">
        <TopSection />
        <QuoteSection />
        <FeatureSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
