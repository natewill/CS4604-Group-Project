import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MyRuns.css";
import "../styles/LeaderDashboard.css";
import { useAuth } from "../context/AuthContext";
import RunItem from "../components/RunItem";
import SavedRouteItem from "../components/SavedRouteItem";
import ParticipantModal from "../components/ParticipantModal";
import LeaderStatistics from "../components/LeaderStatistics";
import { getDateLabel, groupRunsByDate } from "../utils/dateUtils";
import {
  fetchMyRuns,
  fetchRunParticipants,
  deleteRun,
  removeParticipant,
} from "../services/runService";
import { fetchSavedRoutes, deleteSavedRoute } from "../services/routeService";

function LeaderDashboard() {
  const { user, isLeader, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("runs");
  const [view, setView] = useState("scheduled");
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Routes state
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [routesError, setRoutesError] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState(null);

  // Redirect non-leaders
  useEffect(() => {
    if (!authLoading) {
      if (!user || !isLeader) {
        navigate("/runfinder");
      }
    }
  }, [user, isLeader, authLoading, navigate]);

  // Fetch hosted runs
  useEffect(() => {
    if (activeTab === "runs") {
      const loadRuns = async () => {
        setLoading(true);
        setError(null);

        try {
          const data = await fetchMyRuns(view, "hosted");
          setRuns(data);
        } catch (err) {
          console.error("Error fetching hosted runs:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      loadRuns();
    }
  }, [activeTab, view]);

  const loadRoutes = async () => {
    setRoutesLoading(true);
    setRoutesError(null);

    try {
      const data = await fetchSavedRoutes();
      setSavedRoutes(data);
    } catch (err) {
      console.error("Error fetching saved routes:", err);
      setRoutesError(err.message);
    } finally {
      setRoutesLoading(false);
    }
  };

  // Fetch saved routes
  useEffect(() => {
    if (activeTab === "routes") {
      loadRoutes();
    }
  }, [activeTab]);

  // Group runs by date
  const groupedRuns = groupRunsByDate(runs);

  // Handle delete run
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

  // Handle view participants button click
  const handleViewParticipants = async (run) => {
    setSelectedRun(run);
    setModalOpen(true);
    setParticipantsLoading(true);
    setParticipantsError(null);

    try {
      const participantData = await fetchRunParticipants(run.run_id);
      setParticipants(participantData);
    } catch (err) {
      console.error("Error fetching participants:", err);
      setParticipantsError(err.message);
    } finally {
      setParticipantsLoading(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRun(null);
    setParticipants([]);
    setParticipantsError(null);
  };

  // Handle removing a participant
  const handleRemoveParticipant = async (participantId) => {
    if (!selectedRun) return;

    if (
      !window.confirm(
        "Are you sure you want to remove this participant from the run?"
      )
    ) {
      return;
    }

    try {
      await removeParticipant(selectedRun.run_id, participantId);

      // Update the participants list
      setParticipants((prevParticipants) =>
        prevParticipants.filter((p) => p.runner_id !== participantId)
      );

      // Update the participant count in the runs list
      setRuns((prevRuns) =>
        prevRuns.map((run) =>
          run.run_id === selectedRun.run_id
            ? { ...run, participant_count: run.participant_count - 1 }
            : run
        )
      );

      // Update selectedRun to reflect the new count
      setSelectedRun((prevRun) => ({
        ...prevRun,
        participant_count: prevRun.participant_count - 1,
      }));
    } catch (err) {
      console.error("Error removing participant:", err);
      alert(err.message || "Failed to remove participant. Please try again.");
    }
  };

  // Handle delete saved route
  const handleDeleteSavedRoute = async (routeId) => {
    try {
      await deleteSavedRoute(routeId);
      // Remove the route from the list
      setSavedRoutes((prevRoutes) =>
        prevRoutes.filter((route) => route.route_id !== routeId)
      );
    } catch (err) {
      console.error("Error deleting saved route:", err);
      alert(err.message || "Failed to delete saved route. Please try again.");
    }
  };

  if (authLoading) {
    return (
      <div className="my-runs-container">
        <p className="empty-state">Loading...</p>
      </div>
    );
  }

  return (
    <div className="my-runs-container">
      <h1>Leader Dashboard</h1>

      {/* Header with Tabs and Action Buttons */}
      <div className="leader-dashboard-header">
        {/* Tab Navigation */}
        <div className="leader-dashboard-tabs">
          <button
            onClick={() => setActiveTab("runs")}
            className={`leader-dashboard-tab ${
              activeTab === "runs" ? "active" : "inactive"
            }`}
          >
            Runs
          </button>
          <button
            onClick={() => setActiveTab("routes")}
            className={`leader-dashboard-tab ${
              activeTab === "routes" ? "active" : "inactive"
            }`}
          >
            Routes
          </button>
        </div>

        {/* Action Buttons */}
        <div className="leader-dashboard-actions">
          {activeTab === "runs" && (
            <button
              onClick={() => navigate("/runs/new")}
              className="leader-dashboard-action-btn"
            >
              New Run
            </button>
          )}
          {activeTab === "routes" && (
            <button
              onClick={() => navigate("/create-route")}
              className="leader-dashboard-action-btn"
            >
              Create Route
            </button>
          )}
        </div>
      </div>

      {/* Runs Tab Content */}
      {activeTab === "runs" && (
        <>
          {/* Leader Statistics Section */}
          <LeaderStatistics />

          {/* View Toggle */}
          <div className="leader-dashboard-view-toggle">
            <button
              onClick={() =>
                setView(view === "scheduled" ? "past" : "scheduled")
              }
              className="leader-dashboard-view-link"
            >
              {view === "scheduled" ? "Past View" : "Scheduled View"}
            </button>
          </div>

          {/* Loading State */}
          {loading && <p className="empty-state">Loading...</p>}

          {/* Error State */}
          {error && (
            <p className="empty-state" style={{ color: "red" }}>
              Error: {error}
            </p>
          )}

          {/* Runs List */}
          {!loading && !error && runs.length === 0 ? (
            <p className="empty-state">No {view} hosted runs</p>
          ) : !loading && !error ? (
            <div>
              {Object.entries(groupedRuns).map(([date, runsOnDate]) => (
                <div key={date}>
                  <div className="date-header">{getDateLabel(date)}</div>
                  {runsOnDate.map((run) => (
                    <RunItem
                      key={run.run_id}
                      run={run}
                      onDelete={handleDeleteRun}
                      onViewParticipants={handleViewParticipants}
                      showCountdown={true}
                      isLeader={true}
                      currentUserId={user?.runner_id}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}

      {/* Routes Tab Content */}
      {activeTab === "routes" && (
        <>
          {/* Loading State */}
          {routesLoading && <p className="empty-state">Loading...</p>}

          {/* Error State */}
          {routesError && (
            <p className="empty-state" style={{ color: "red" }}>
              Error: {routesError}
            </p>
          )}

          {/* Routes List */}
          {!routesLoading && !routesError && savedRoutes.length === 0 ? (
            <div className="leader-dashboard-routes-empty">
              <p className="empty-state">No saved routes yet</p>
              <p className="leader-dashboard-routes-empty-subtitle">
                Create your first route to get started!
              </p>
            </div>
          ) : !routesLoading && !routesError ? (
            <div>
              {savedRoutes.map((route) => (
                <SavedRouteItem
                  key={route.route_id}
                  route={route}
                  onDelete={handleDeleteSavedRoute}
                />
              ))}
            </div>
          ) : null}
        </>
      )}

      {/* Participant Modal */}
      <ParticipantModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        runName={selectedRun?.name}
        participants={participants}
        loading={participantsLoading}
        error={participantsError}
        onRemoveParticipant={handleRemoveParticipant}
      />
    </div>
  );
}

export default LeaderDashboard;
