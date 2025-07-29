import React from "react";

const NewsFilter = ({ activeFilter, setActiveFilter }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Financial News</h1>
        <nav aria-label="Article filters">
          <ul className="flex space-x-2">
            <li>
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-md transition ${
                  activeFilter === "all"
                    ? "bg-royal text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                aria-pressed={activeFilter === "all"}
              >
                All Articles
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveFilter("read")}
                className={`px-4 py-2 rounded-md transition ${
                  activeFilter === "read"
                    ? "bg-royal text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                aria-pressed={activeFilter === "read"}
              >
                Read Articles
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveFilter("feedback")}
                className={`px-4 py-2 rounded-md transition ${
                  activeFilter === "feedback"
                    ? "bg-royal text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                aria-pressed={activeFilter === "feedback"}
              >
                Articles with Feedback
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default NewsFilter;
