import React, { useState, useEffect } from "react";
import "../styles/MyRuns.css";
import { useAuth } from "../context/AuthContext";
import RunItem from "../components/RunItem";
import { getDateLabel, groupRunsByDate } from "../utils/dateUtils";

function MyRuns() {
  const { user, isLeader } = useAuth();
  const [view, setView] = useState("scheduled");
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch runs from backend
  useEffect(() => {
    const fetchRuns = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/my-runs?filter=${view}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch runs");
        }

        const data = await response.json();
        setRuns(data);
      } catch (err) {
        console.error("Error fetching runs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();
  }, [view]);

  // Group runs by date
  const groupedRuns = groupRunsByDate(runs);

  // Handle leave run
  const handleLeaveRun = async (runId) => {
    try {
      const response = await fetch(`/api/runs/${runId}/leave`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to leave run");
      }

      // Remove the run from the list
      setRuns((prevRuns) => prevRuns.filter((run) => run.run_id !== runId));
    } catch (err) {
      console.error("Error leaving run:", err);
      alert("Failed to leave run. Please try again.");
    }
  };

  // Handle delete run (leaders only)
  const handleDeleteRun = async (runId) => {
    try {
      const response = await fetch(`/api/runs/${runId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete run");
      }

      // Remove the run from the list
      setRuns((prevRuns) => prevRuns.filter((run) => run.run_id !== runId));
    } catch (err) {
      console.error("Error deleting run:", err);
      alert(err.message || "Failed to delete run. Please try again.");
    }
  };

  return (
    <div className="my-runs-container">
      <h1>My Runs</h1>

      {/* Toggle Button */}
      <div className="toggle-buttons">
        <button onClick={() => setView(view === "scheduled" ? "past" : "scheduled")}>
          {view === "scheduled" ? "Scheduled" : "Past"}
        </button>
      </div>

      {/* Loading State */}
      {loading && <p className="empty-state">Loading...</p>}

      {/* Error State */}
      {error && <p className="empty-state" style={{ color: "red" }}>Error: {error}</p>}

      {/* Runs List */}
      {!loading && !error && runs.length === 0 ? (
        <p className="empty-state">No {view} runs</p>
      ) : !loading && !error ? (
        <div>
          {Object.entries(groupedRuns).map(([date, runsOnDate]) => (
            <div key={date}>
              <div className="date-header">{getDateLabel(date)}</div>
              {runsOnDate.map((run) => (
                <RunItem
                  key={run.run_id}
                  run={run}
                  onLeave={handleLeaveRun}
                  onDelete={handleDeleteRun}
                  showCountdown={view === "scheduled"}
                  isLeader={isLeader}
                  currentUserId={user?.runner_id}
                />
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default MyRuns;

