import React, { useState, useEffect } from 'react';

/**
 * Component to display a static map for a route using the /api/static-map endpoint
 */
export const RouteMapImage = ({ route, alt = "Route map" }) => {
  const [mapUrl, setMapUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!route || !route.polyline || !route.start_lat || !route.start_lng || !route.end_lat || !route.end_lng) {
      return;
    }

    // Fetch the static map URL from the API
    const params = new URLSearchParams({
      polyline: route.polyline,
      start_lat: route.start_lat,
      start_lng: route.start_lng,
      end_lat: route.end_lat,
      end_lng: route.end_lng,
    });

    console.log('Fetching static map for route:', params.toString());

    fetch(`/api/static-map?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch map');
        return res.json();
      })
      .then((data) => {
        setMapUrl(data.url);
      })
      .catch((err) => {
        console.error('Error fetching static map:', err);
        setError(true);
      });
  }, [route]);

  if (error || !mapUrl) {
    return (
      <div
        style={{
          width: '100%',
          height: '400px',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
        }}
      >
        <p style={{ color: '#666' }}>Map unavailable</p>
      </div>
    );
  }

  return (
    <img
      src={mapUrl}
      alt={alt}
      style={{
        width: '100%',
        height: '400px',
        objectFit: 'cover',
        borderRadius: '8px',
        border: '1px solid #ddd',
      }}
      onError={(e) => {
        e.target.style.display = 'none';
        setError(true);
      }}
    />
  );
};


