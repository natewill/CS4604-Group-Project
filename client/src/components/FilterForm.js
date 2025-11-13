import React from "react";
import { Autocomplete } from "@react-google-maps/api";

function FilterForm({
  filters,
  setFilters,
  clearFilters,
  locationAutocompleteRef,
  handleLocationSelect,
  setSearchLocationCoords,
}) {
  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc", marginBottom: "1rem" }}>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <div>
          <label>Min Pace (MM:SS):</label>
          <input
            type="text"
            placeholder="00:00"
            value={filters.paceMin}
            onChange={(e) => setFilters({ ...filters, paceMin: e.target.value })}
          />
        </div>
        <div>
          <label>Max Pace (MM:SS):</label>
          <input
            type="text"
            placeholder="00:00"
            value={filters.paceMax}
            onChange={(e) => setFilters({ ...filters, paceMax: e.target.value })}
          />
        </div>
        <div>
          <label>Date From:</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          />
        </div>
        <div>
          <label>Date To:</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          />
        </div>
        <div>
          <label>Search Leader:</label>
          <input
            type="text"
            placeholder="Leader name"
            value={filters.searchLeader}
            onChange={(e) => setFilters({ ...filters, searchLeader: e.target.value })}
          />
        </div>
        <div>
          <label>Search Run Name:</label>
          <input
            type="text"
            placeholder="Run name"
            value={filters.searchName}
            onChange={(e) => setFilters({ ...filters, searchName: e.target.value })}
          />
        </div>
        <div>
          <label>Search Location:</label>
          <Autocomplete
            onLoad={(ref) => {
              locationAutocompleteRef.current = ref;
            }}
            onPlaceChanged={handleLocationSelect}
          >
            <input
              type="text"
              placeholder="Enter location"
              style={{ width: "100%" }}
            />
          </Autocomplete>
        </div>
        <button onClick={clearFilters}>Clear Filters</button>
      </div>
    </div>
  );
}

export default FilterForm;

