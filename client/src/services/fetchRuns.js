/**
 * Fetches runs from the server with optional filters
 * @param {Object} filters - Filter object with paceMin (seconds), paceMax (seconds), dateFrom, dateTo, searchLeader, searchName
 * @param {Object} searchLocationCoords - Search location coordinates { lat, lng }
 * @param {Object} userLocation - User location coordinates { lat, lng }
 * @returns {Promise<Array>} Promise that resolves to an array of run objects
 */
export const fetchRuns = async (filters, searchLocationCoords, userLocation) => {
  const queryParams = new URLSearchParams();

  // Add pace filters (already in seconds)
  if (filters.paceMin) {
    queryParams.append('paceMin', filters.paceMin);
  }
  if (filters.paceMax) {
    queryParams.append('paceMax', filters.paceMax);
  }

  // Add date filters
  if (filters.dateFrom) {
    queryParams.append('dateFrom', filters.dateFrom);
  }
  if (filters.dateTo) {
    queryParams.append('dateTo', filters.dateTo);
  }

  // Add text search filters
  if (filters.searchLeader) {
    queryParams.append('searchLeader', filters.searchLeader);
  }
  if (filters.searchName) {
    queryParams.append('searchName', filters.searchName);
  }

  // Add location filter (prioritize search location, then user location)
  const locationForDistance = searchLocationCoords || userLocation;
  if (locationForDistance) {
    queryParams.append('lat', locationForDistance.lat.toString());
    queryParams.append('lng', locationForDistance.lng.toString());
    queryParams.append('maxDistance', '3'); // 3 miles
  }

  const res = await fetch(`/api/runs?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch runs');
  }
  return res.json();
};

