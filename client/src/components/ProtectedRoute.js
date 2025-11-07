import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute component that validates authentication
 * - If loading, shows a loading indicator
 * - If not authenticated, redirects to /login
 * - If authenticated, renders the protected component
 */
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected component
  return children;
}
