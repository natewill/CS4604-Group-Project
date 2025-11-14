import { formatPace } from '../utils/formatPace';
import '../styles/RunFinder.css';

/**
 * RouteCard component
 * @param {Object} run - The run object
 * @param {boolean} isSelected - Whether the run is selected
 * @param {function} onClick - The function to call when the card is clicked
 * @param {Object} user - The current user object
 * @param {function} onSaveRoute - Function to save the route
 * @param {function} onJoinRun - Function to join the run
 * @returns {React.ReactNode} The RouteCard component
 */
const RouteCard = ({ run, isSelected, onClick, user, onSaveRoute, onJoinRun }) => (
  <div
    onClick={onClick}
    className={`route-card ${isSelected ? 'selected' : ''}`}
  >
    <div className="route-card-header">
      <h2>{run.name}</h2>
      <div className="route-card-actions">
        {user && (user.is_leader === 1 || user.is_leader === true) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSaveRoute(run.run_route);
            }}
          >
            Save Route
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (user) {
              onJoinRun(run.run_id);
            } else {
              alert("Please log in to join runs");
              window.location.href = "/login";
            }
          }}
        >
          Join Run
        </button>
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
      <p><strong>Date:</strong> {run.date}</p>
      <p><strong>Time:</strong> {run.start_time}</p>
      <p><strong>Pace:</strong> {formatPace(run.pace)}</p>
      <p><strong>Status:</strong> {run.status}</p>
      {run.leader_name && <p><strong>Leader:</strong> {run.leader_name.trim()}</p>}
      {run.distanceFromUser && <p><strong>Distance:</strong> {(run.distanceFromUser / 1609.344).toFixed(2)} miles away</p>}
      {run.distance != null && <p><strong>Route Distance:</strong> {Number(run.distance).toFixed(2)} miles</p>}
    </div>
    <p><strong>Start:</strong> {run.start_address || `${run.start_lat}, ${run.start_lng}`}</p>
    <p><strong>End:</strong> {run.end_address || `${run.end_lat}, ${run.end_lng}`}</p>
    {run.description && <p>{run.description}</p>}
  </div>
);

export default RouteCard;

