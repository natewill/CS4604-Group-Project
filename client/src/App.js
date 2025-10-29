// client/src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Signup from "./signup";

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
  const [runners, setRunners] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    // Fetch all runners
    fetch("/api/runners")
      .then((res) => res.json())
      .then((data) => setRunners(data))
      .catch((err) => console.error(err));

    // Fetch summary
    fetch("/api/summary")
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <Routes>
        <Route path="/summary" element={<Summary runners={runners} summary={summary} />} />
        <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;
