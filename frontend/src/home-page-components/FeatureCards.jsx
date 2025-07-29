import React from "react";
import { features } from "./featureList.jsx";
import AuthAwareFeatureCard from "./AuthAwareFeatureCard";

const FeatureCards = () => {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-3 gap-10 py-12 w-5/6 mx-auto list-none p-0">
      {features.map((feat) => (
        <li key={feat.title} className="m-0 p-0">
          <AuthAwareFeatureCard {...feat} />
        </li>
      ))}
    </ul>
  );
};

export default FeatureCards;
