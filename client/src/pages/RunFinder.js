import React, { useState, useEffect, useCallback } from 'react';
import { RouteMapImage } from './map/mapscreenshot';

function RunFinder() {
  const [allRuns, setAllRuns] = useState([]);
  const [runs, setRuns] = useState([]);
  const [error, setError] = useState(null);
  
  // Search filter states
  const [paceMin, setPaceMin] = useState('');
  const [paceMax, setPaceMax] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchLeader, setSearchLeader] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  // Helper function to convert pace string to minutes
  const paceToMinutes = (paceStr) => {
    if (!paceStr) return null;
    const parts = paceStr.split(':');
    if (parts.length !== 2) return null;
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    if (isNaN(minutes) || isNaN(seconds)) return null;
    return minutes + seconds / 60;
  };

  // Helper function to parse formatted date string to Date object
  const parseFormattedDate = (dateStr) => {
    if (!dateStr) return null;
    // Format is "Month DD, YYYY" (e.g., "January 01, 2026")
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  // Filter runs based on search criteria
  const filterRuns = useCallback(() => {
    let filtered = [...allRuns];

    // Pace range filter
    if (paceMin || paceMax) {
      filtered = filtered.filter((run) => {
        const runPace = paceToMinutes(run.pace);
        if (runPace === null) return false;
        
        if (paceMin && paceMax) {
          const minPace = paceToMinutes(paceMin);
          const maxPace = paceToMinutes(paceMax);
          if (minPace === null || maxPace === null) return true;
          return runPace >= minPace && runPace <= maxPace;
        } else if (paceMin) {
          const minPace = paceToMinutes(paceMin);
          if (minPace === null) return true;
          return runPace >= minPace;
        } else if (paceMax) {
          const maxPace = paceToMinutes(paceMax);
          if (maxPace === null) return true;
          return runPace <= maxPace;
        }
        return true;
      });
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filtered = filtered.filter((run) => {
        const runDate = parseFormattedDate(run.date);
        if (runDate === null) return false;

        if (dateFrom && dateTo) {
          const fromDate = new Date(dateFrom);
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999); // Include entire end date
          return runDate >= fromDate && runDate <= toDate;
        } else if (dateFrom) {
          const fromDate = new Date(dateFrom);
          return runDate >= fromDate;
        } else if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999); // Include entire end date
          return runDate <= toDate;
        }
        return true;
      });
    }

    // Leader name filter (fuzzy search)
    if (searchLeader.trim()) {
      const leaderSearch = searchLeader.trim().toLowerCase();
      filtered = filtered.filter((run) => {
        const leaderName = (run.leader_name || '').toLowerCase();
        const firstName = (run.leader_first_name || '').toLowerCase();
        const lastName = (run.leader_last_name || '').toLowerCase();
        return (
          leaderName.includes(leaderSearch) ||
          firstName.includes(leaderSearch) ||
          lastName.includes(leaderSearch)
        );
      });
    }

    // Run name filter (fuzzy search)
    if (searchName.trim()) {
      const nameSearch = searchName.trim().toLowerCase();
      filtered = filtered.filter((run) => {
        return (run.name || '').toLowerCase().includes(nameSearch);
      });
    }

    // Location filter (fuzzy search on both start and end addresses)
    if (searchLocation.trim()) {
      const locationSearch = searchLocation.trim().toLowerCase();
      filtered = filtered.filter((run) => {
        const startAddr = (run.start_address || '').toLowerCase();
        const endAddr = (run.end_address || '').toLowerCase();
        return (
          startAddr.includes(locationSearch) ||
          endAddr.includes(locationSearch)
        );
      });
    }

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
        setRuns(data);
      })
      .catch((err) => {
        console.error('Failed to fetch runs:', err);
        setError(err.message);
      });
  }, []);

  // Apply filters whenever filter state changes
  useEffect(() => {
    const filtered = filterRuns();
    setRuns(filtered);
  }, [filterRuns]);

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Run Finder</h1>

      {/* Search Form */}
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          backgroundColor: '#f9f9f9',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>
          Search Filters
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          {/* Pace Range */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: '500' }}>
              Pace Min (MM:SS)
            </label>
            <input
              type="text"
              value={paceMin}
              onChange={(e) => setPaceMin(e.target.value)}
              placeholder="e.g., 07:00"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: '500' }}>
              Pace Max (MM:SS)
            </label>
            <input
              type="text"
              value={paceMax}
              onChange={(e) => setPaceMax(e.target.value)}
              placeholder="e.g., 09:00"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
            />
          </div>

          {/* Date Range */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: '500' }}>
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: '500' }}>
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
            />
          </div>

          {/* Leader Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: '500' }}>
              Leader Name
            </label>
            <input
              type="text"
              value={searchLeader}
              onChange={(e) => setSearchLeader(e.target.value)}
              placeholder="Search by leader name"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
            />
          </div>

          {/* Run Name Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: '500' }}>
              Run Name
            </label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Search by run name"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
            />
          </div>

          {/* Location Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: '500' }}>
              Location
            </label>
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Search by location"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={clearFilters}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Results Count */}
      {runs.length === 0 && allRuns.length > 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic', marginBottom: '1rem' }}>
          No runs match your search criteria.
        </p>
      ) : runs.length > 0 ? (
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Showing {runs.length} of {allRuns.length} runs
        </p>
      ) : null}

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

