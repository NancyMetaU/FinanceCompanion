import React, { useState, useEffect } from "react";
import Header from "../shared-components/Header";
import Footer from "../shared-components/Footer";
import Sidebar from "../shared-components/Sidebar";
import ErrorMessage from "../shared-components/ErrorMessage";
import Loading from "../shared-components/Loading";
import ArticleGrid from "../news-page-components/ArticleGrid";
import fallbackNewsData from "../mock/newsData.json";
import { getAuth } from "firebase/auth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [digestibilityScores, setDigestibilityScores] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getNews = async () => {
      try {
        setIsLoading(true);

        const cached = sessionStorage.getItem("newsArticles");
        if (cached) {
          setArticles(JSON.parse(cached));
          return;
        }

        const response = await fetch(`${BACKEND_URL}/api/news/`);
        if (!response.ok) throw new Error(`Error ${response.status}`);

        const apiArticles = await response.json();
        const merged = [...apiArticles, ...fallbackNewsData];

        sessionStorage.setItem("newsArticles", JSON.stringify(merged));
        setArticles(merged);
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

  useEffect(() => {
    const fetchDigestibilityScores = async () => {
      if (!articles.length) return;

      try {
        const user = getAuth().currentUser;
        if (!user) throw new Error("User not authenticated");
        const idToken = await user.getIdToken();

        const scorePromises = articles.map(async (article) => {
          try {
            const response = await fetch(
              `${BACKEND_URL}/api/digestibility/score`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({ article }),
              }
            );

            if (!response.ok) {
              throw new Error(
                `Error ${response.status}: Failed to fetch digestibility score`
              );
            }

            const scoreData = await response.json();
            return { articleId: article.uuid, scoreData };
          } catch (err) {
            console.error(
              `Error fetching digestibility score for article ${article.uuid}:`,
              err
            );
            return { articleId: article.uuid, scoreData: null };
          }
        });

        const results = await Promise.all(scorePromises);

        const newScores = {};
        results.forEach(({ articleId, scoreData }) => {
          if (scoreData) {
            newScores[articleId] = scoreData;
          }
        });

        setDigestibilityScores(newScores);
      } catch (err) {
        console.error("Error fetching digestibility scores:", err);
      }
    };

    fetchDigestibilityScores();
  }, [articles]);

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
            <ArticleGrid
              articles={articles.map((article) => ({
                ...article,
                digestibility: digestibilityScores[article.uuid] || null,
              }))}
            />
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default NewsPage;
