import React from "react";
import Article from "./Article";

const ArticleGrid = ({ articles }) => {
  const validArticles = articles?.filter((article) => article.uuid) || [];

  if (validArticles.length === 0) {
    return (
      <section className="w-full py-12 text-center">
        <p className="text-lg text-gray-500">No articles found</p>
      </section>
    );
  }

  return (
    <section className="w-full py-4">
      <ul className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 list-none p-0">
        {validArticles.map((article) => (
          <li key={article.uuid}>
            <Article article={article} />
          </li>
        ))}
      </ul>
    </section>
  );
};

ArticleGrid.defaultProps = {
  articles: [],
};

export default ArticleGrid;
