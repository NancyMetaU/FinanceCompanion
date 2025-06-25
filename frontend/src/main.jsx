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

const routes = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />
  },
  {
    path: '/login',
    element: <AuthPage />,
  },
  {
    path: '/budget',
    element: <BudgetPage />,
  },
  {
    path: '/learning',
    element: <LearningPage />,
  },
  {
    path: '/news',
    element: <NewsPage />,
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={routes} />
  </StrictMode>,
)
