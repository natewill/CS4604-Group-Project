import React, { useState, useEffect } from 'react';
import { RouteMapImage } from './map/mapscreenshot';

function RunFinder() {
  const [runs, setRuns] = useState([]);
  const [error, setError] = useState(null);

  //fetch all runs from the database
  useEffect(() => {
    fetch('/api/runs')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch runs');
        return res.json();
      })
      .then((data) => {
        setRuns(data);
      })
      .catch((err) => {
        console.error('Failed to fetch runs:', err);
        setError(err.message);
      });
  }, []);

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Run Finder</h1>

      {/* Runs Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.5rem',
          marginTop: '1.5rem',
        }}
      >
        {runs.map((run) => (
          <div
            key={run.run_id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '12px',
              padding: '1rem',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              backgroundColor: '#fdfdfd',
            }}
          >
            {/* Static Map */}
            <RouteMapImage
              route={{
                polyline: run.polyline,
                start_lat: run.start_lat,
                start_lng: run.start_lng,
                end_lat: run.end_lat,
                end_lng: run.end_lng,
              }}
              alt={`Route for ${run.name}`}
            />

            {/* Run Information */}
            <div style={{ marginTop: '0.75rem' }}>
              <h2 style={{ marginBottom: '0.25rem', marginTop: 0, fontSize: '1.25rem' }}>
                {run.name}
              </h2>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>Date:</strong> {run.date}</p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>Time:</strong> {run.start_time}</p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>Pace:</strong> {run.pace}</p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>Status:</strong> {run.status}</p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>Start:</strong> {run.start_address ? run.start_address : run.start_lat + ', ' + run.start_lng}</p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>End:</strong> {run.end_address ? run.end_address : run.end_lat + ', ' + run.end_lng}</p>
              {run.distance != null && (
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>Distance:</strong> {Number(run.distance).toFixed(2)} miles</p>
              )}
              {run.description && <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>{run.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RunFinder;

