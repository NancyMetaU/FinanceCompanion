import React from "react";

const FeaturedArticle = ({ article }) => {
  return (
    <div className="mb-20 flex flex-col lg:flex-row gap-15 overflow-hidden">
      <img
        src={article.image_url}
        alt={article.title}
        className="w-full lg:w-1/4 aspect-square object-cover rounded-md lg:ml-20 mx-auto"
      />
      <div className="p-6 flex flex-col justify-center lg:w-2/3">
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          {article.title}
        </h2>
        <p className="text-muted-foreground mb-4">{article.description}</p>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-roya font-semibold hover:underline"
        >
          Read More →
        </a>
      </div>
    </div>
  );
};

export default FeaturedArticle;
