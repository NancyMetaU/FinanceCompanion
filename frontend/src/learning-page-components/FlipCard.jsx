import { useState } from "react";

const FlipCard = ({ title, description, link, linkText }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="flip-card w-80 h-80 perspective-1000 cursor-pointer mb-6"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`flip-card-inner relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        <article className="flip-card-front absolute w-full h-full rounded-lg shadow-lg flex flex-col items-center justify-center p-6 backface-hidden">
          <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
          <p className="text-center text-sm text-gray-600">
            Click to learn more
          </p>
        </article>
        <article className="flip-card-back absolute w-full h-full rounded-lg shadow-lg flex flex-col items-center p-6 backface-hidden rotate-y-180">
          <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
          <section className="text-center text-sm mb-4 flex-grow overflow-y-auto text-gray-700">
            <p className="font-medium mb-2">Definition:</p>
            <p>{description}</p>
          </section>
          {link && (
            <a
              href={link}
              className="px-4 py-2 bg-gradient-to-r from-blue-300 to-blue-400 text-white rounded-md hover:from-blue-400 hover:to-blue-500 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border border-blue-200"
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
            >
              {linkText || "Learn more"}
            </a>
          )}
        </article>
      </div>
      <style jsx={true}>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .flip-card-front {
          background: linear-gradient(135deg, #e0f2fe, #bfdbfe);
          border: 1px solid #bfdbfe;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .flip-card-back {
          background: white;
          border: 2px solid #bfdbfe;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
};

export default FlipCard;
