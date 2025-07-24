import React, { useEffect, useState } from "react";
import { Quote } from "lucide-react";

const quotes = [
  {
    text: "The best investment you can make is in yourself.",
    author: "Warren Buffett",
  },
  {
    text: "A big part of financial freedom is having your heart and mind free from worry about the what-ifs of life.",
    author: "Suze Orman",
  },
  {
    text: "A budget is telling your money where to go instead of wondering where it went.",
    author: "Dave Ramsey",
  },
];

const QuoteSection = () => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentQuote((prev) => (prev + 1) % quotes.length);
        setIsVisible(true);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 px-6 bg-gradient-to-r from-royal/5 to-blue-400/5">
      <figure className="max-w-4xl mx-auto text-center relative">
        <figcaption className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <Quote className="h-12 w-12 text-royal/20" />
        </figcaption>

        <blockquote
          className={`transition-all duration-500 ease-in-out pt-9 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-2xl md:text-3xl text-slate-700 italic mb-4">
            "{quotes[currentQuote].text}"
          </p>
          <cite className="text-lg text-slate-500 not-italic">
            — {quotes[currentQuote].author}
          </cite>
        </blockquote>
      </figure>
    </section>
  );
};

export default QuoteSection;
