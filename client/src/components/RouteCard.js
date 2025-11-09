import { formatPace } from '../utils/formatPace';

const cardTextStyle = { fontSize: '0.9rem', marginTop: '0.5rem' };

const RouteCard = ({ run, isSelected, onClick }) => (
  <div
    onClick={onClick}
    style={{
      border: isSelected ? '3px solid #2563eb' : '1px solid #ccc',
      borderRadius: '8px',
      padding: '1rem',
      backgroundColor: isSelected ? '#eff6ff' : '#fff',
      cursor: 'pointer',
    }}
  >
    <h2 style={{ margin: '0 0 0.5rem 0' }}>{run.name}</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.9rem' }}>
      <p><strong>Date:</strong> {run.date}</p>
      <p><strong>Time:</strong> {run.start_time}</p>
      <p><strong>Pace:</strong> {formatPace(run.pace)}</p>
      <p><strong>Status:</strong> {run.status}</p>
      {run.leader_name && <p><strong>Leader:</strong> {run.leader_name.trim()}</p>}
      {run.distanceFromUser && <p><strong>Distance:</strong> {(run.distanceFromUser / 1609.344).toFixed(2)} miles away</p>}
      {run.distance != null && <p><strong>Route Distance:</strong> {Number(run.distance).toFixed(2)} miles</p>}
    </div>
    <p style={cardTextStyle}><strong>Start:</strong> {run.start_address || `${run.start_lat}, ${run.start_lng}`}</p>
    <p style={cardTextStyle}><strong>End:</strong> {run.end_address || `${run.end_lat}, ${run.end_lng}`}</p>
    {run.description && <p style={cardTextStyle}>{run.description}</p>}
  </div>
);

export default RouteCard;

