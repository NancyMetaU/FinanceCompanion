import React from "react";

const ArticleGrid = ({ articles }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, index) => (
        <div key={article.uuid || index} className="flex flex-col items-center">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-3/5 aspect-square object-cover rounded-md"
          />

          <div className="mt-4 w-3/5">
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {article.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {article.snippet || article.description}
            </p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00009A] font-semibold hover:underline"
            >
              Read More →
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArticleGrid;
