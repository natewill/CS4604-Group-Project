// client/src/App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Signup from "./pages/signup";
import Signin from "./pages/signin";
import CreateRoute from "./pages/CreateRoute";
import Runs from "./pages/Runs";
import NewRun from "./pages/NewRun";
import RunFinder from "./pages/RunFinder";

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
          <li key={runner.runner_id}>
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
    fetch("/api/runners")
      .then((res) => res.json())
      .then((data) => setRunners(data))
      .catch((err) => console.error(err));

    fetch("/api/summary")
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      {/*  Navbar stays here, no nested Router */}
      <nav
        style={{
          display: "flex",
          gap: "1rem",
          padding: "1rem",
          backgroundColor: "#eee",
        }}
      >
        <Link to="/summary">Summary</Link>
        <Link to="/runs">Runs</Link>
        <Link to="/runs/finder">Find Runs</Link>
        <Link to="/signup">Signup</Link>
        <Link to="/signin">Signin</Link>
        <Link to="/create-route">Create Route</Link>
      </nav>

      <Routes>
        <Route
          path="/summary"
          element={<Summary runners={runners} summary={summary} />}
        />
        <Route path="/runs" element={<Runs />} />
        <Route path="/runs/new" element={<NewRun />} />
        <Route path="/runs/finder" element={<RunFinder />} />
        <Route path="/create-route" element={<CreateRoute />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
      </Routes>
    </div>
  );
}

export default App;
