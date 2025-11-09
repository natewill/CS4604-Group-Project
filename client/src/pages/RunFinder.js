import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from '@react-google-maps/api';
import polyline from '@mapbox/polyline';
import { fetchRuns as fetchRunsService } from '../services/fetchRuns';
import RouteCard from '../components/RouteCard';
import FilterForm from '../components/FilterForm';
import { buildIcons } from '../utils/map/icons';
import '../styles/RunFinder.css';

const mapOptions = {
  streetViewControl: false,
  fullscreenControl: false,
  mapTypeControl: true,
  styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }]
};

// Constants
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
  const [runs, setRuns] = useState([]);
  
  // Google Maps and location state
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_LOCATION);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchLocationCoords, setSearchLocationCoords] = useState(null);
  const locationAutocompleteRef = useRef(null);
  const [customIcons, setCustomIcons] = useState(null);
  
  // Search filter states - consolidated
  const [filters, setFilters] = useState({
    paceMin: '',
    paceMax: '',
    dateFrom: '',
    dateTo: '',
    searchLeader: '',
    searchName: '',
  });

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'geometry'],
    onError: () => {
      alert('google maps api not working');
    },
  });

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      alert('geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(location);
        setMapCenter(location);
      },
      (error) => {
        console.error('Error getting location:', error);
        setUserLocation(DEFAULT_LOCATION);
        setMapCenter(DEFAULT_LOCATION);
      }
    );
  }, []);

  // Handle location autocomplete selection
  const handleLocationSelect = () => {
    if (locationAutocompleteRef.current) {
      const place = locationAutocompleteRef.current.getPlace();
      if (place && place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setSearchLocationCoords(location);
        setMapCenter(location);
      }
    }
  };

  // Fetch runs from server with filters
  const fetchRuns = useCallback(async () => {
    const data = await fetchRunsService(filters, searchLocationCoords, userLocation);
    setRuns(data);
    
    // Always select the first run from results
    const newSelected = data[0] || null;
    setSelectedRun(newSelected);
    if (newSelected) {
      setMapCenter(getRunCoords(newSelected));
    }
  }, [filters, searchLocationCoords, userLocation]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      paceMin: '', paceMax: '', dateFrom: '', dateTo: '', searchLeader: '', searchName: '',
    });
    setSearchLocationCoords(null);
  };

  // Fetch runs when filters or location changes
  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  // Handle route card click
  const handleRouteClick = (run) => {
    setSelectedRun(run);
    setMapCenter(getRunCoords(run));
  };

  // Get polyline path for selected run
  const getPolylinePath = (run) => {
    if (!run || !run.polyline) return [];
    const decoded = polyline.decode(run.polyline);
    return decoded.map(([lat, lng]) => ({ lat, lng }));
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        <button onClick={() => setFiltersOpen(!filtersOpen)}>
          Search Filters! {filtersOpen ? '▼' : '▶'}
        </button>
        {filtersOpen && (
          <FilterForm
            filters={filters}
            setFilters={setFilters}
            clearFilters={clearFilters}
            locationAutocompleteRef={locationAutocompleteRef}
            handleLocationSelect={handleLocationSelect}
            setSearchLocationCoords={setSearchLocationCoords}
          />
        )}
      </div>

      <div className="main-content">
        <div>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={13}
            options={mapOptions}
            onLoad={(map) => {
              map.setMapTypeId("hybrid");
              const icons = buildIcons(window.google);
              if (icons) setCustomIcons(icons);
            }}
          >
            {searchLocationCoords && window.google && (
              <Marker
                position={searchLocationCoords}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#10b981',
                  fillOpacity: 1,
                  strokeColor: '#fff',
                  strokeWeight: 3,
                }}
              />
            )}
            {userLocation && !searchLocationCoords && window.google && (
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
                options={{ strokeColor: '#2563eb', strokeOpacity: 1, strokeWeight: 10 }}
              />
            )}
            {selectedRun && (
              <>
                <Marker position={getRunCoords(selectedRun)} icon={customIcons?.startIcon} />
                <Marker position={getRunEndCoords(selectedRun)} icon={customIcons?.endIcon} />
              </>
            )}
          </GoogleMap>
        </div>

        <div className="cards-container">
          {runs.length === 0 ? (
            <p>
              {(searchLocationCoords || userLocation) ? 'No runs within 3 miles match your search criteria.' : 'No runs match your search criteria.'}
            </p>
          ) : runs.length > 0 && (
            <>
              <p>
                Showing {runs.length} run{runs.length !== 1 ? 's' : ''}{(searchLocationCoords || userLocation) ? ' within 3 miles' : ''}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

