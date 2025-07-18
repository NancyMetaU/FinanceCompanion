import React, { useState, useEffect } from "react";
import Header from "../shared-components/Header";
import Footer from "../shared-components/Footer";
import Sidebar from "../shared-components/Sidebar";
import ErrorMessage from "../shared-components/ErrorMessage";
import Loading from "../shared-components/Loading";
import ArticleGrid from "../news-page-components/ArticleGrid";
import fallbackNewsData from "../mock/newsData.json";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getNews = async () => {
      try {
        setIsLoading(true);
        // const response = await fetch(`${BACKEND_URL}/api/news/`); // Later this line will be uncommented to fetch real news data

        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch news`);
        }

        const data = await response.json();
        setArticles(data);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError(err.message || "Failed to load news articles");
        setArticles(fallbackNewsData);
      } finally {
        setIsLoading(false);
      }
    };

    getNews();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 px-10 py-10">
          {error && <ErrorMessage message={error} />}

          {isLoading ? (
            <Loading message="Loading news articles..." />
          ) : (
            <ArticleGrid articles={articles} />
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default NewsPage;
