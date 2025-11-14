import React from "react";
import { convertTo12Hour } from "../utils/timeUtils";
import { useCountdown } from "../utils/useCountdown";
import { getStaticMapUrl } from "../utils/mapUtils";

function RunItem({ run, onLeave, onDelete, showCountdown, isLeader, currentUserId }) {
  const countdown = useCountdown(run.date, run.start_time);
  const isRunLeader = isLeader && run.leader_id === currentUserId;

  const handleLeave = () => {
    if (window.confirm(`Are you sure you want to leave "${run.name}"?`)) {
      onLeave(run.run_id);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${run.name}"? This will remove all participants from the run.`)) {
      onDelete(run.run_id);
    }
  };

  return (
    <div className={`run-item ${!showCountdown ? "past" : ""}`}>
      <div className="run-actions-top">
        {showCountdown ? (
          <>
            {isRunLeader ? (
              <button onClick={handleDelete}>Delete</button>
            ) : (
              <button onClick={handleLeave}>Leave</button>
            )}
          </>
        ) : (
          <>
            {isRunLeader && (
              <button onClick={handleDelete}>Delete</button>
            )}
          </>
        )}
      </div>

      <img
        src={getStaticMapUrl(run)}
        alt="Route map"
        className="map-thumbnail"
      />

      <div className="run-info">
        <div>
          <div className="run-datetime">
            {new Date(run.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            at {convertTo12Hour(run.start_time)}
            {showCountdown && countdown && (
              <span className="countdown"> • {countdown}</span>
            )}
          </div>
          <h3>{run.name}</h3>
          <div className="run-meta">
            {run.distance} mi • {run.leader_name}
          </div>
        </div>
        {run.description && (
          <div className="run-description">{run.description}</div>
        )}
      </div>
    </div>
  );
}

export default RunItem;

