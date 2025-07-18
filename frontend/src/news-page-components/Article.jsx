import React from "react";
import DigestibilityLabel from "./DigestibilityLabel";
import DigestibilityTag from "./DigestibilityTag";

const Article = ({
  image_url,
  title,
  snippet,
  description,
  url,
  digestibility,
}) => {
  return (
    <article className="flex flex-col h-full border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="w-full h-48 overflow-hidden">
        {image_url ? (
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <p className="text-gray-400">No image available</p>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-grow p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-2 flex-1 mr-2">
            {title}
          </h3>
        </div>
        {digestibility && (
          <div className="mb-3">
            <DigestibilityLabel
              label={digestibility.label}
              score={digestibility.score}
            />
          </div>
        )}
        <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">
          {snippet || description || "No description available"}
        </p>
        <div className="flex justify-between items-end mt-auto">
          <a
            href={url}
            target="_blank"
            className="text-royal font-semibold hover:underline inline-flex items-center"
          >
            Read More <span className="ml-1">→</span>
          </a>

          {digestibility?.explanation?.flags &&
            digestibility.explanation.flags.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-end">
                {digestibility.explanation.flags.map((flag, index) => (
                  <DigestibilityTag
                    key={index}
                    label={flag.label}
                    type={flag.type}
                    impact={flag.impact}
                    normalized={flag.normalized}
                  />
                ))}
              </div>
            )}
        </div>
      </div>
    </article>
  );
};

export default Article;
