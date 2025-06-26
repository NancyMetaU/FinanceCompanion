import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AuthPage from './pages/AuthPage.jsx'
import BudgetPage from './pages/BudgetPage.jsx'
import LearningPage from './pages/LearningPage.jsx'
import NewsPage from './pages/NewsPage.jsx'
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const routes = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    errorElement: <NotFoundPage />
  },
  {
    path: '/login',
    element: <AuthPage />,
  },
  {
    path: '/budget',
    element: (
      <ProtectedRoute>
        <BudgetPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/learning',
    element: (
      <ProtectedRoute>
        <LearningPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/news',
    element: (
      <ProtectedRoute>
        <NewsPage />
      </ProtectedRoute>
    ),
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={routes} />
    </AuthProvider>
  </StrictMode>,
)
