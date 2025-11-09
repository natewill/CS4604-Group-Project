import React, { useState, useEffect, useCallback } from 'react';
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from '@react-google-maps/api';
import { getDistance } from 'geolib';
import polyline from '@mapbox/polyline';
import {
  filterByPaceRange,
  filterByDateRange,
  filterByLeaderName,
  filterByRunName,
  filterByLocation,
} from '../utils/runFilters';
import PaceSlider from '../components/PaceSlider';
import RouteCard from '../components/RouteCard';

// Shared styles
const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' };
const labelStyle = { display: 'block', marginBottom: '0.25rem' };
const filterButtonStyle = { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' };
const filterPanelStyle = { marginTop: '1rem', padding: '1.5rem', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' };
const filterGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' };
const clearButtonStyle = { padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const filterHeaderStyle = { padding: '1rem 2rem', backgroundColor: '#f9f9f9', borderBottom: '1px solid #ddd' };
const mainContentStyle = { display: 'flex', height: 'calc(100vh - 150px)' };
const mapContainerStyle = { flex: '1 1 65%', height: '100%' };
const cardsContainerStyle = { flex: '1 1 35%', height: '100%', padding: '1rem', backgroundColor: '#f9f9f9', overflowY: 'auto' };
const cardsListStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const mapOptions = {
  streetViewControl: false,
  fullscreenControl: false,
  mapTypeControl: true,
  colorScheme: 'DARK',
  styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }]
};

// Constants
const MAP_ZOOM = 13;
const DEFAULT_LOCATION = { lat: 37.2296, lng: -80.4139 }; // Blacksburg

// Helper functions
const getRunCoords = (run) => ({
  lat: parseFloat(run.start_lat),
  lng: parseFloat(run.start_lng),
});

const getRunEndCoords = (run) => ({
  lat: parseFloat(run.end_lat),
  lng: parseFloat(run.end_lng),
});

function RunFinder() {
  const [allRuns, setAllRuns] = useState([]);
  const [runs, setRuns] = useState([]);
  const [error, setError] = useState(null);
  
  // Google Maps and location state
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_LOCATION);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Search filter states - consolidated
  const [filters, setFilters] = useState({
    paceMin: '',
    paceMax: '',
    dateFrom: '',
    dateTo: '',
    searchLeader: '',
    searchName: '',
    searchLocation: '',
  });

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
        setUserLocation(DEFAULT_LOCATION);
        setMapCenter(DEFAULT_LOCATION);
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
        const runCoords = getRunCoords(run);
        const distance = getDistance(
          { latitude: userLoc.lat, longitude: userLoc.lng },
          { latitude: runCoords.lat, longitude: runCoords.lng }
        );
        return { ...run, distanceFromUser: distance };
      })
      .filter((run) => run.distanceFromUser <= distanceInMeters)
      .sort((a, b) => a.distanceFromUser - b.distanceFromUser);

    return runsWithDistance;
  }, []);

  // Filter runs based on search criteria
  const filterRuns = useCallback(() => {
    return [
      (runs) => filterByPaceRange(runs, filters.paceMin, filters.paceMax),
      (runs) => filterByDateRange(runs, filters.dateFrom, filters.dateTo),
      (runs) => filterByLeaderName(runs, filters.searchLeader),
      (runs) => filterByRunName(runs, filters.searchName),
      (runs) => filterByLocation(runs, filters.searchLocation),
    ].reduce((filtered, filterFn) => filterFn(filtered), [...allRuns]);
  }, [filters, allRuns]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      paceMin: '',
      paceMax: '',
      dateFrom: '',
      dateTo: '',
      searchLeader: '',
      searchName: '',
      searchLocation: '',
    });
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
        setMapCenter(getRunCoords(newSelected));
        return newSelected;
      }
      
      return null;
    });
  }, [filterRuns, userLocation, filterRunsByDistance]);

  // Handle route card click
  const handleRouteClick = (run) => {
    setSelectedRun(run);
    setMapCenter(getRunCoords(run));
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
      <div style={filterHeaderStyle}>
        <button onClick={() => setFiltersOpen(!filtersOpen)} style={filterButtonStyle}>
          Search Filters {filtersOpen ? '▼' : '▶'}
        </button>
        {filtersOpen && (
          <div style={filterPanelStyle}>
            <div style={filterGridStyle}>
              <PaceSlider
                label="Pace Min"
                value={filters.paceMin}
                onChange={(value) => setFilters({ ...filters, paceMin: value })}
                defaultValue={300}
              />
              <PaceSlider
                label="Pace Max"
                value={filters.paceMax}
                onChange={(value) => setFilters({ ...filters, paceMax: value })}
                defaultValue={600}
              />
              <div>
                <label style={labelStyle}>Date From</label>
                <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Date To</label>
                <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Leader Name</label>
                <input type="text" value={filters.searchLeader} onChange={(e) => setFilters({ ...filters, searchLeader: e.target.value })} placeholder="Search by leader name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Run Name</label>
                <input type="text" value={filters.searchName} onChange={(e) => setFilters({ ...filters, searchName: e.target.value })} placeholder="Search by run name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <input type="text" value={filters.searchLocation} onChange={(e) => setFilters({ ...filters, searchLocation: e.target.value })} placeholder="Search by location" style={inputStyle} />
              </div>
            </div>
            <button onClick={clearFilters} style={clearButtonStyle}>Clear Filters</button>
          </div>
        )}
      </div>

      <div style={mainContentStyle}>
        <div style={mapContainerStyle}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={MAP_ZOOM}
            options={mapOptions}
          >
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
            {selectedRun?.polyline && (
              <Polyline
                path={getPolylinePath(selectedRun)}
                options={{ strokeColor: '#2563eb', strokeOpacity: 1, strokeWeight: 6 }}
              />
            )}
            {selectedRun && (
              <>
                <Marker position={getRunCoords(selectedRun)} label="Start" />
                <Marker position={getRunEndCoords(selectedRun)} label="End" />
              </>
            )}
          </GoogleMap>
        </div>

        <div style={cardsContainerStyle}>
          {runs.length === 0 && allRuns.length > 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              {userLocation ? 'No runs within 3 miles match your search criteria.' : 'No runs match your search criteria.'}
            </p>
          ) : runs.length > 0 && (
            <>
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                Showing {runs.length} run{runs.length !== 1 ? 's' : ''}{userLocation ? ' within 3 miles' : ''}
              </p>
              <div style={cardsListStyle}>
              {runs.map((run) => (
                <RouteCard
                  key={run.run_id}
                  run={run}
                  isSelected={selectedRun?.run_id === run.run_id}
                  onClick={() => handleRouteClick(run)}
                />
              ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RunFinder;

