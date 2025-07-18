import React from "react";

const Article = ({ image_url, title, snippet, description, url }) => {
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
        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">
          {snippet || description || "No description available"}
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-royal font-semibold hover:underline inline-flex items-center mt-auto"
        >
          Read More <span className="ml-1">→</span>
        </a>
      </div>
    </article>
  );
};

export default Article;
