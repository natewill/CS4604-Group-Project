import React, { useState, useEffect, useCallback } from 'react';
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from '@react-google-maps/api';
import { getDistance } from 'geolib';
import polyline from '@mapbox/polyline';
import { formatPace } from '../utils/formatPace';
import { paceToSeconds } from '../utils/paceToSeconds';
import {
  filterByPaceRange,
  filterByDateRange,
  filterByLeaderName,
  filterByRunName,
  filterByLocation,
} from '../utils/runFilters';

// Shared styles
const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' };
const labelStyle = { display: 'block', marginBottom: '0.25rem' };

function RunFinder() {
  const [allRuns, setAllRuns] = useState([]);
  const [runs, setRuns] = useState([]);
  const [error, setError] = useState(null);
  
  // Google Maps and location state
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.2296, lng: -80.4139 }); // Blacksburg default
  const [mapZoom, setMapZoom] = useState(13);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Search filter states
  const [paceMin, setPaceMin] = useState('');
  const [paceMax, setPaceMax] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchLeader, setSearchLeader] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'geometry'],
  });

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setMapCenter(location);
      },
      (error) => {
        console.error('Error getting location:', error);
        // Use default location (Blacksburg)
        setUserLocation({ lat: 37.2296, lng: -80.4139 });
        setMapCenter({ lat: 37.2296, lng: -80.4139 });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, []);

  // Filter runs by distance (within specified miles)
  const filterRunsByDistance = useCallback((runsToFilter, userLoc, miles = 3) => {
    if (!userLoc) return runsToFilter;

    const distanceInMeters = miles * 1609.344; // Convert miles to meters
    const runsWithDistance = runsToFilter
      .map((run) => {
        const distance = getDistance(
          { latitude: userLoc.lat, longitude: userLoc.lng },
          { latitude: parseFloat(run.start_lat), longitude: parseFloat(run.start_lng) }
        );
        return { ...run, distanceFromUser: distance };
      })
      .filter((run) => run.distanceFromUser <= distanceInMeters)
      .sort((a, b) => a.distanceFromUser - b.distanceFromUser);

    return runsWithDistance;
  }, []);

  // Filter runs based on search criteria
  const filterRuns = useCallback(() => {
    let filtered = [...allRuns];

    filtered = filterByPaceRange(filtered, paceMin, paceMax); //returns runs with pace between paceMin and paceMax
    filtered = filterByDateRange(filtered, dateFrom, dateTo); //returns runs between dateFrom and dateTo
    filtered = filterByLeaderName(filtered, searchLeader); //returns runs by leader name
    filtered = filterByRunName(filtered, searchName); //returns runs by run name
    filtered = filterByLocation(filtered, searchLocation); //returns runs by location

    return filtered;
  }, [paceMin, paceMax, dateFrom, dateTo, searchLeader, searchName, searchLocation, allRuns]);

  // Clear all filters
  const clearFilters = () => {
    setPaceMin('');
    setPaceMax('');
    setDateFrom('');
    setDateTo('');
    setSearchLeader('');
    setSearchName('');
    setSearchLocation('');
  };

  // Fetch all runs from the database
  useEffect(() => {
    fetch('/api/runs')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch runs');
        return res.json();
      })
      .then((data) => {
        setAllRuns(data);
      })
      .catch((err) => {
        console.error('Failed to fetch runs:', err);
        setError(err.message);
      });
  }, []);

  // Apply filters and distance filtering whenever filter state or location changes
  useEffect(() => {
    // First apply search filters
    const searchFiltered = filterRuns();
    
    // Then apply distance filtering if user location is available
    const finalFiltered = userLocation 
      ? filterRunsByDistance(searchFiltered, userLocation)
      : searchFiltered;
    
    setRuns(finalFiltered);
    
    // Update selected run if current selection is no longer in filtered results
    setSelectedRun((currentSelected) => {
      // If current selection is still valid, keep it
      if (currentSelected && finalFiltered.some(r => r.run_id === currentSelected.run_id)) {
        return currentSelected;
      }
      
      // Otherwise, select first run if available
      if (finalFiltered.length > 0) {
        const newSelected = finalFiltered[0];
        setMapCenter({
          lat: parseFloat(newSelected.start_lat),
          lng: parseFloat(newSelected.start_lng),
        });
        return newSelected;
      }
      
      return null;
    });
  }, [filterRuns, userLocation, filterRunsByDistance]);

  // Handle route card click
  const handleRouteClick = (run) => {
    setSelectedRun(run);
    setMapCenter({
      lat: parseFloat(run.start_lat),
      lng: parseFloat(run.start_lng),
    });
  };

  // Get polyline path for selected run
  const getPolylinePath = (run) => {
    if (!run || !run.polyline) return [];
    try {
      const decoded = polyline.decode(run.polyline);
      return decoded.map(([lat, lng]) => ({ lat, lng }));
    } catch (error) {
      console.error('Error decoding polyline:', error);
      return [];
    }
  };

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  if (!isLoaded) {
    return <div style={{ padding: '2rem' }}>Loading Google Maps...</div>;
  }

  return (
    <div>
      {/* Collapsible Filter Dropdown */}
      <div style={{ padding: '1rem 2rem', backgroundColor: '#f9f9f9', borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
        >
          Search Filters {filtersOpen ? '▼' : '▶'}
        </button>

        {filtersOpen && (
          <div style={{ marginTop: '1rem', padding: '1.5rem', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>
                  Pace Min: {paceMin || '--:--'}
                </label>
                <input 
                  type="range" 
                  min="240" 
                  max="900" 
                  step="15"
                  value={paceMin ? (paceToSeconds(paceMin) || 300) : 300}
                  onChange={(e) => {
                    const seconds = parseInt(e.target.value, 10);
                    const minutes = Math.floor(seconds / 60);
                    const secs = seconds % 60;
                    setPaceMin(`${minutes}:${secs.toString().padStart(2, '0')}`);
                  }}
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                  <span>4:00</span>
                  <span>15:00</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>
                  Pace Max: {paceMax || '--:--'}
                </label>
                <input 
                  type="range" 
                  min="240" 
                  max="900" 
                  step="15"
                  value={paceMax ? (paceToSeconds(paceMax) || 600) : 600}
                  onChange={(e) => {
                    const seconds = parseInt(e.target.value, 10);
                    const minutes = Math.floor(seconds / 60);
                    const secs = seconds % 60;
                    setPaceMax(`${minutes}:${secs.toString().padStart(2, '0')}`);
                  }}
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                  <span>4:00</span>
                  <span>15:00</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Date From</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Date To</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Leader Name</label>
                <input type="text" value={searchLeader} onChange={(e) => setSearchLeader(e.target.value)} placeholder="Search by leader name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Run Name</label>
                <input type="text" value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder="Search by run name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <input type="text" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} placeholder="Search by location" style={inputStyle} />
              </div>
            </div>
            <button onClick={clearFilters} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Main content area - side by side */}
      <div style={{ display: 'flex', height: 'calc(100vh - 150px)' }}>
        {/* Google Maps - Left side */}
        <div style={{ flex: '1 1 65%', height: '100%' }}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={mapZoom}
            options={{
              streetViewControl: false,
              fullscreenControl: false,
              mapTypeControl: true,
              colorScheme: 'DARK',
              styles: [
                {
                  featureType: 'poi',
                  stylers: [{ visibility: 'off' }]
                }
              ]
            }}
          >
            {/* User location marker */}
            {userLocation && isLoaded && window.google && (
              <Marker
                position={userLocation}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#4285F4',
                  fillOpacity: 1,
                  strokeColor: '#fff',
                  strokeWeight: 3,
                }}
              />
            )}

            {/* Selected route polyline */}
            {selectedRun && selectedRun.polyline && (
              <Polyline
                path={getPolylinePath(selectedRun)}
                options={{
                  strokeColor: '#2563eb',
                  strokeOpacity: 1,
                  strokeWeight: 6,
                }}
              />
            )}

            {/* Start marker for selected route */}
            {selectedRun && (
              <Marker
                position={{
                  lat: parseFloat(selectedRun.start_lat),
                  lng: parseFloat(selectedRun.start_lng),
                }}
                label="Start"
              />
            )}

            {/* End marker for selected route */}
            {selectedRun && (
              <Marker
                position={{
                  lat: parseFloat(selectedRun.end_lat),
                  lng: parseFloat(selectedRun.end_lng),
                }}
                label="End"
              />
            )}
          </GoogleMap>
        </div>

        {/* Route Cards Section - Right side */}
        <div style={{ flex: '1 1 35%', height: '100%', padding: '1rem', backgroundColor: '#f9f9f9', overflowY: 'auto' }}>
        {runs.length === 0 && allRuns.length > 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            {userLocation ? 'No runs within 3 miles match your search criteria.' : 'No runs match your search criteria.'}
          </p>
        ) : runs.length > 0 ? (
          <>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              {userLocation ? `Showing ${runs.length} run${runs.length !== 1 ? 's' : ''} within 3 miles` : `Showing ${runs.length} run${runs.length !== 1 ? 's' : ''}`}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {runs.map((run) => {
                const isSelected = selectedRun?.run_id === run.run_id;
                return (
                  <div
                    key={run.run_id}
                    onClick={() => handleRouteClick(run)}
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
                    <p style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}><strong>Start:</strong> {run.start_address || `${run.start_lat}, ${run.start_lng}`}</p>
                    <p style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}><strong>End:</strong> {run.end_address || `${run.end_lat}, ${run.end_lng}`}</p>
                    {run.description && <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>{run.description}</p>}
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </div>
  </div>
  );
}

export default RunFinder;

