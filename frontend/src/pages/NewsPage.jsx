import React from "react";
import Header from "../shared-components/Header";
import Footer from "../shared-components/Footer";
import Sidebar from "../shared-components/Sidebar";
import FeaturedArticle from "../news-page-components/FeaturedArticle";
import ArticleGrid from "../news-page-components/ArticleGrid";
import newsData from "../mock/newsData.json";

const NewsPage = () => {
  const [featured, ...rest] = newsData;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 px-10 py-10">
          <FeaturedArticle {...featured} />
          <ArticleGrid articles={rest} />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default NewsPage;
