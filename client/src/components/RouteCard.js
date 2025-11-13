import { formatPace } from '../utils/paceFormatters';
import '../styles/RunFinder.css';

/**
 * RouteCard component
 * @param {Object} run - The run object
 * @param {boolean} isSelected - Whether the run is selected
 * @param {function} onClick - The function to call when the card is clicked
 * @returns {React.ReactNode} The RouteCard component
 */
const RouteCard = ({ run, isSelected, onClick }) => (
  <div
    onClick={onClick}
    className={`route-card ${isSelected ? 'selected' : ''}`}
  >
    <h2>{run.name}</h2>
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

