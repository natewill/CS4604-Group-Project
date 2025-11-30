import React from "react";
import { getStaticMapUrl } from "../utils/mapUtils";

function SavedRouteItem({ route, onDelete }) {
  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to remove this route from your saved routes?"
      )
    ) {
      onDelete(route.route_id);
    }
  };

  return (
    <div className="run-item">
      <div className="run-actions-top">
        <button onClick={handleDelete}>Delete</button>
      </div>

      <img
        src={getStaticMapUrl(route)}
        alt="Route map"
        className="map-thumbnail"
      />

      <div className="run-info">
        <div>
          <h3>Route #{route.route_id}</h3>
          <div className="run-meta">
            {route.distance
              ? `${Number(route.distance).toFixed(2)} mi`
              : "Distance not available"}
          </div>
        </div>
        <div>
          <p>
            <strong>Start:</strong>{" "}
            {route.start_address || `${route.start_lat}, ${route.start_lng}`}
          </p>
          <p>
            <strong>End:</strong>{" "}
            {route.end_address || `${route.end_lat}, ${route.end_lng}`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SavedRouteItem;
