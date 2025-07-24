import React from "react";
import { features } from "./featureList.jsx";
import FeatureCard from "./FeatureCard";

const FeatureCards = () => {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-3 gap-10 py-12 w-5/6 mx-auto list-none p-0">
      {features.map((feat) => (
        <li key={feat.title} className="m-0 p-0">
          <FeatureCard {...feat} />
        </li>
      ))}
    </ul>
  );
};

export default FeatureCards;
