import React from "react";
import FeatureCards from "./FeatureCards";

const FeatureSection = () => (
    <section className="py-20 px-6">
        <header className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-royal to-blue-500 bg-clip-text text-transparent inline-block mb-4">
                Explore Our Features
            </h2>
            <hr className="h-1 w-20 bg-gradient-to-r from-royal to-blue-400 mx-auto rounded-full border-0" />
        </header>
        <FeatureCards />
    </section>
);

export default FeatureSection;
