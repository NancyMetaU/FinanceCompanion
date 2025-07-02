import React from "react";
import Header from "../components/Header";
import PictureSlider from "../home-page-components/PictureSlider";
import FeatureCards from "../home-page-components/FeatureCards";

const HomePage = () => {
  return (
    <div className="home-page">
      <Header />
      <main>
        <PictureSlider />
        <section className="features-section">
          <h2>What We Offer</h2>
          <FeatureCards />
        </section>
      </main>
    </div>
  );
};

export default HomePage;
