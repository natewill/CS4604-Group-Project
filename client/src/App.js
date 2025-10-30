// client/src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Signup from "./pages/signup";
import Signin from "./pages/signin";
import CreateRoute from "./pages/CreateRoute";

function Summary({ runners, summary }) {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Database Summary</h1>
      <p>DB Name: {summary.dbName}</p>
      <p>Number of runners: {summary.runnersCount}</p>
      <p>Number of runs: {summary.runsCount}</p>

      <h2>Runners List</h2>
      <ul>
        {runners.map((runner) => (
          <li key={runner.Runner_ID}>
            {runner.first_name} {runner.last_name}
          </li>
        ))}
      </ul>
    </div>
  );
}
function App() {
  return (
    <Routes>
        <Route path="/summary" element={<Summary runners={runners} summary={summary} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/create-route" element={<CreateRoute />} />
    </Routes>
  );
}

export default App;
