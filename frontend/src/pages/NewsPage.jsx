import React, { useState, useEffect, useCallback } from "react";
import Header from "../shared-components/Header";
import Footer from "../shared-components/Footer";
import Sidebar from "../shared-components/Sidebar";
import ErrorMessage from "../shared-components/ErrorMessage";
import Loading from "../shared-components/Loading";
import NewsFilter from "../news-page-components/NewsFilter";
import FilteredArticles from "../news-page-components/FilteredArticles";
import fallbackNewsData from "../mock/newsData.json";
import { getAuth } from "firebase/auth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [digestibilityScores, setDigestibilityScores] = useState({});
  const [digestibilityRefreshTrigger, setDigestibilityRefreshTrigger] =
    useState(0);
  const [userContext, setUserContext] = useState({
    readArticles: [],
    feedback: {},
  });

  const handleArticleReadStatusChange = useCallback(
    (articleId, isRead, industry, timeSpent = 0) => {
      setUserContext((prevContext) => {
        if (isRead) {
          const articleExists = prevContext.readArticles?.some(
            (item) => item.articleId === articleId
          );
          if (!articleExists) {
            return {
              ...prevContext,
              readArticles: [
                ...(prevContext.readArticles || []),
                {
                  articleId,
                  readAt: new Date().toISOString(),
                  industry,
                  timeSpent,
                },
              ],
            };
          }
        } else {
          return {
            ...prevContext,
            readArticles: (prevContext.readArticles || []).filter(
              (item) => item.articleId !== articleId
            ),
          };
        }
        return prevContext;
      });
    },
    []
  );

  const handleArticleFeedbackChange = useCallback(
    (articleId, rating, industry) => {
      setUserContext((prevContext) => {
        return {
          ...prevContext,
          feedback: {
            ...(prevContext.feedback || {}),
            [articleId]: {
              rating,
              submittedAt: new Date().toISOString(),
              industry,
            },
          },
        };
      });
    },
    []
  );
  const [activeFilter, setActiveFilter] = useState("all");
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
  }, [articles, digestibilityRefreshTrigger]);

  useEffect(() => {
    const fetchUserContext = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) return;

        const idToken = await user.getIdToken();
        const res = await fetch(`${BACKEND_URL}/api/articleContext`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load user article context");
        const data = await res.json();
        setUserContext(data);
      } catch (err) {
        console.error("Error fetching user context:", err);
      }
    };

    fetchUserContext();
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <Header />
      <div className="flex flex-col md:flex-row flex-1">
        <Sidebar />
        <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
          {error && <ErrorMessage message={error} />}

          <section>
            {isLoading ? (
              <Loading message="Loading news articles..." />
            ) : (
              <>
                <NewsFilter
                  activeFilter={activeFilter}
                  setActiveFilter={setActiveFilter}
                />

                <FilteredArticles
                  articles={articles}
                  activeFilter={activeFilter}
                  userContext={userContext}
                  digestibilityScores={digestibilityScores}
                  onDigestibilityChange={() =>
                    setDigestibilityRefreshTrigger((prev) => prev + 1)
                  }
                  onArticleReadStatusChange={handleArticleReadStatusChange}
                  onArticleFeedbackChange={handleArticleFeedbackChange}
                />
              </>
            )}
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default NewsPage;
