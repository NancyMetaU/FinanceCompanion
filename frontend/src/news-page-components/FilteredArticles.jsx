import React from "react";
import ArticleGrid from "./ArticleGrid";

const FilteredArticles = ({
  articles,
  activeFilter,
  userContext,
  digestibilityScores,
  onDigestibilityChange,
  onArticleReadStatusChange,
  onArticleFeedbackChange,
}) => {
  const filteredArticles = articles
    .filter((article) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "read") {
        return (
          userContext.readArticles &&
          userContext.readArticles.some(
            (readArticle) => readArticle.articleId === article.uuid
          )
        );
      }
      if (activeFilter === "feedback") {
        return userContext.feedback && userContext.feedback[article.uuid];
      }
      return true;
    })
    .map((article) => ({
      ...article,
      digestibility: digestibilityScores[article.uuid] || null,
    }));

  return (
    <ArticleGrid
      key={`${activeFilter}-${userContext.readArticles?.length || 0}`}
      articles={filteredArticles}
      onDigestibilityChange={onDigestibilityChange}
      userContext={userContext}
      onArticleReadStatusChange={onArticleReadStatusChange}
      onArticleFeedbackChange={onArticleFeedbackChange}
    />
  );
};

export default FilteredArticles;
