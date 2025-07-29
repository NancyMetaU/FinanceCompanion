import "./index.css";
import "./firebase";
import App from "./App.jsx";
import { StrictMode } from "react";
import NewsPage from "./pages/NewsPage.jsx";
import { createRoot } from "react-dom/client";
import BudgetPage from "./pages/BudgetPage.jsx";
import LearningPage from "./pages/LearningPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./context/ProtectedRoute";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/budget",
    element: (
      <ProtectedRoute>
        <BudgetPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/learning",
    element: (
      <ProtectedRoute>
        <LearningPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/news",
    element: (
      <ProtectedRoute>
        <NewsPage />
      </ProtectedRoute>
    ),
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={routes} />
    </AuthProvider>
  </StrictMode>
);
