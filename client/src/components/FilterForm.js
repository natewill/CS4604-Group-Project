import { Autocomplete } from '@react-google-maps/api';
import PaceSlider from './PaceSlider';
import DistanceSlider from './DistanceSlider';

const FilterForm = ({
  filters,
  setFilters,
  clearFilters,
  locationAutocompleteRef,
  handleLocationSelect,
  setSearchLocationCoords,
}) => {
  const handleChange = (field) => (e) => setFilters({ ...filters, [field]: e.target.value });

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
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
      <DistanceSlider
        label="Distance Min"
        value={filters.distanceMin}
        onChange={(value) => setFilters({ ...filters, distanceMin: value })}
        defaultValue={0}
      />
      <DistanceSlider
        label="Distance Max"
        value={filters.distanceMax}
        onChange={(value) => setFilters({ ...filters, distanceMax: value })}
        defaultValue={15}
      />
      <div>
        <label>Date From</label>
        <input type="date" value={filters.dateFrom} onChange={handleChange('dateFrom')} />
      </div>
      <div>
        <label>Date To</label>
        <input type="date" value={filters.dateTo} onChange={handleChange('dateTo')} />
      </div>
      <div>
        <label>Leader Name</label>
        <input type="text" value={filters.searchLeader} onChange={handleChange('searchLeader')} placeholder="Search by leader name" />
      </div>
      <div>
        <label>Run Name</label>
        <input type="text" value={filters.searchName} onChange={handleChange('searchName')} placeholder="Search by run name" />
      </div>
      <div>
        <label>Location</label>
        <Autocomplete
          onLoad={(ref) => (locationAutocompleteRef.current = ref)}
          onPlaceChanged={handleLocationSelect}
        >
          <input
            type="text"
            placeholder="Search by location (finds runs within 3 miles)"
            onChange={(e) => {
              if (!e.target.value) {
                setSearchLocationCoords(null);
              }
            }}
          />
        </Autocomplete>
      </div>
    </div>
    <button onClick={clearFilters}>Clear Filters</button>
  </div>
  );
};

export default FilterForm;

