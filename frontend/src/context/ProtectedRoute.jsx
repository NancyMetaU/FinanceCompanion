import Loading from "../shared-components/Loading";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loading message="Checking authentication..." />;
  return user ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
