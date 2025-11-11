import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PublicRoute component for login/signup pages
 * - If authenticated, redirects to /home
 * - If not authenticated, renders the public component
 */
export default function PublicRoute({ children }) {
  const { user } = useAuth();

  // If authenticated, redirect to home
  if (user) {
    return <Navigate to="/home" replace />;
  }

  // If not authenticated, render the public component
  return children;
}