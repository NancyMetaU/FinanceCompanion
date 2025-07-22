import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import DigestibilityLabel from "./DigestibilityLabel";
import DigestibilityTag from "./DigestibilityTag";
import FeedbackModal from "./FeedbackModal";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Article = ({ article }) => {
  const [isRead, setIsRead] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [articleWindowRef, setArticleWindowRef] = useState(null);
  const [articleOpenTime, setArticleOpenTime] = useState(null);

  const getCurrentUserToken = async () => {
    const user = getAuth().currentUser;
    if (!user) throw new Error("User not authenticated");
    return await user.getIdToken();
  };

  const markAsRead = async (timeSpentSeconds = null) => {
    try {
      const idToken = await getCurrentUserToken();
      const articleData = {
        id: article.uuid,
        industry: article.entities[0]?.industry,
        ...(timeSpentSeconds !== null && { timeSpent: timeSpentSeconds }),
      };

      const response = await fetch(`${BACKEND_URL}/api/articleContext/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ articleData }),
      });

      if (!response.ok)
        throw new Error(`Server responded with status: ${response.status}`);
      setIsRead(true);
    } catch (error) {
      console.error("Error marking article as read:", error);
    }
  };

  const unmarkAsRead = async () => {
    try {
      const idToken = await getCurrentUserToken();
      const response = await fetch(
        `${BACKEND_URL}/api/articleContext/read/${article.uuid}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (!response.ok)
        throw new Error(`Server responded with status: ${response.status}`);
      setIsRead(false);
    } catch (error) {
      console.error("Error unmarking article as read:", error);
    }
  };

  const handleMarkAsRead = () => {
    isRead ? unmarkAsRead() : markAsRead();
  };

  const handleReadMoreClick = () => {
    const newWindow = window.open(article.url, "_blank");

    if (newWindow) {
      setArticleWindowRef(newWindow);
      setArticleOpenTime(Date.now());

      const intervalId = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(intervalId);
          const timeSpentMs = Date.now() - articleOpenTime;
          const timeSpentSeconds = Math.round(timeSpentMs / 1000);
          markAsRead(timeSpentSeconds);
        }
      }, 500);
    } else {
      console.warn("Popup blocked or failed to open.");
    }
  };

  const articlePreview =
    article.snippet || article.description || "No description available";

  return (
    <article className="flex flex-col h-full border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="w-full h-48 overflow-hidden relative">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <p className="text-gray-400">No image available</p>
          </div>
        )}

        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <button
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer"
            onClick={handleMarkAsRead}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={isRead ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isRead ? "text-royal" : "text-gray-700"}
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer text-gray-600 hover:text-royal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-grow p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-2 flex-1">
            {article.title}
          </h3>
        </div>

        {article.digestibility && (
          <div className="mb-3">
            <DigestibilityLabel
              label={article.digestibility.label}
              score={article.digestibility.score}
            />
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">
          {articlePreview}
        </p>

        <div className="flex justify-between items-end mt-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReadMoreClick}
              className="text-royal font-semibold hover:underline inline-flex items-center"
            >
              Read More <span className="ml-1">→</span>
            </button>
          </div>

          {article.digestibility?.explanation?.flags?.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-end">
              {article.digestibility.explanation.flags.map((flag, index) => (
                <DigestibilityTag
                  key={index}
                  label={flag.label}
                  type={flag.type}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        article={article}
      />
    </article>
  );
};

export default Article;
