import React from "react";
import Article from "./Article";

const ArticleGrid = ({ articles }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles
        .filter((article) => article.uuid)
        .map((article) => (
          <Article key={article.uuid} {...article} />
        ))}
    </div>
  );
};

export default ArticleGrid;
