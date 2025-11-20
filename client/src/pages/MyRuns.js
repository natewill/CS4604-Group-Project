import React, { useState, useEffect } from "react";
import "../styles/MyRuns.css";
import { useAuth } from "../context/AuthContext";
import RunItem from "../components/RunItem";
import { getDateLabel, groupRunsByDate } from "../utils/dateUtils";
import { fetchMyRuns, leaveRun, deleteRun } from "../services/runService";
import { routeSave } from "../services/routeSave";

function MyRuns() {
  const { user, isLeader } = useAuth();
  const [view, setView] = useState("scheduled");
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch runs from backend
  useEffect(() => {
    const loadRuns = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchMyRuns(view);
        setRuns(data);
      } catch (err) {
        console.error("Error fetching runs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRuns();
  }, [view]);

  // Group runs by date
  const groupedRuns = groupRunsByDate(runs);

  // Handle leave run
  const handleLeaveRun = async (runId) => {
    try {
      await leaveRun(runId);
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
      await deleteRun(runId);
      // Remove the run from the list
      setRuns((prevRuns) => prevRuns.filter((run) => run.run_id !== runId));
    } catch (err) {
      console.error("Error deleting run:", err);
      alert(err.message || "Failed to delete run. Please try again.");
    }
  };

  // Handle save route (leaders only, for joined runs)
  const handleSaveRoute = async (run) => {
    try {
      const routeData = {
        start_lat: run.start_lat,
        start_lng: run.start_lng,
        end_lat: run.end_lat,
        end_lng: run.end_lng,
        start_address: run.start_address || null,
        end_address: run.end_address || null,
        polyline: run.polyline,
        distance: run.distance,
      };
      
      await routeSave(routeData);
      alert("Route saved successfully!");
    } catch (err) {
      console.error("Error saving route:", err);
      alert(err.message || "Failed to save route. Please try again.");
    }
  };

  return (
    <div className="my-runs-container">
      <h1>{isLeader ? "Joined Runs" : "My Runs"}</h1>

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
        <p className="empty-state">No {view} {isLeader ? "joined" : ""} runs</p>
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
                  onSaveRoute={isLeader ? handleSaveRoute : undefined}
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

