import React from "react";
import Footer from "../shared-components/Footer";
import Header from "../shared-components/Header";
import FeatureCards from "../home-page-components/FeatureCards";
import PictureSlider from "../home-page-components/PictureSlider";

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <PictureSlider />
        <section className="mt-12 px-6">
          <h2 className="text-4xl mb-4 text-center text-slate-800">Explore</h2>
          <FeatureCards />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
