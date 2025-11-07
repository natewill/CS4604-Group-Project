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

function App() {
  return (
    <AuthProvider>
      <div>
        <Routes>
          {/* Default route - redirects to /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/*pages with no nav bar */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Signin />} />

          {/*pages with nav bar */}
          <Route element={<Layout />}>
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
