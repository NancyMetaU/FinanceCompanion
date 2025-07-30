import { useState } from "react";
import FlipCard from "./FlipCard";

const ExpandableModule = ({ title, concepts }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <button
        className="w-full bg-blue-50 p-4 text-left font-semibold text-lg flex justify-between items-center hover:bg-blue-100 transition-colors cursor-pointer"
        onClick={toggleExpand}
      >
        <span>{title}</span>
        <span className="text-blue-500">{isExpanded ? "▲" : "▼"}</span>
      </button>

      {isExpanded && (
        <section className="p-4 bg-white">
          <div className="grid md:grid-cols-2 lg:grid-cols-4">
            {concepts.map((concept, index) => (
              <FlipCard
                key={index}
                title={concept.title}
                description={concept.description}
                link={concept.link}
                linkText={concept.linkText}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ExpandableModule;
