// client/src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Signup from "./pages/signup";
import Signin from "./pages/login";
import CreateRoute from "./pages/CreateRoute";
import Runs from "./pages/Runs";
import NewRun from "./pages/NewRun";
import Home from "./pages/Home";

import Layout from "./components/NavLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <AuthProvider>
      <div>
        <Routes>
          {/* Default route - redirects to /home (will validate cookie) */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Public pages - redirect to home if already authenticated */}
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Signin />
              </PublicRoute>
            }
          />

          {/* Protected pages with nav bar - require authentication */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/runs" element={<Runs />} />
            <Route path="/runs/new" element={<NewRun />} />
            <Route path="/create-route" element={<CreateRoute />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
