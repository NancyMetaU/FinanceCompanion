import React from "react";
import { ArrowDown } from "lucide-react";

const TopSection = () => (
  <section className="relative py-20 px-6 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-70" />

    <article className="max-w-5xl mx-auto relative">
      <h1 className="text-5xl md:text-6xl font-bold text-center mb-6 animate-fade-in-up">
        <span className="bg-gradient-to-r from-royal to-blue-500 bg-clip-text text-transparent">
          Your Financial Journey
        </span>
        <br />
        <span className="text-slate-800">Starts Here</span>
      </h1>

      <p className="text-xl md:text-2xl text-center text-slate-600 max-w-3xl mx-auto mb-10 animate-fade-in-up animation-delay-300">
        Simple tools to help you budget, learn, and stay informed about your
        finances.
      </p>

      <figure className="flex justify-center animate-fade-in-up animation-delay-500">
        <ArrowDown className="h-10 w-10 text-royal animate-bounce" />
      </figure>
    </article>
  </section>
);

export default TopSection;
