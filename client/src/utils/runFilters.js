import FuzzySearch from 'fuzzy-search';
import { paceToSeconds } from './paceToSeconds';

/**
 * Filters runs by pace range
 * @param {Array} runs - Array of run objects
 * @param {string} paceMin - Minimum pace in "MM:SS" format
 * @param {string} paceMax - Maximum pace in "MM:SS" format
 * @returns {Array} Filtered runs array
 */
export const filterByPaceRange = (runs, paceMin, paceMax) => {
  if (!paceMin && !paceMax) return runs;

  return runs.filter((run) => {
    if (run.pace === null || run.pace === undefined) return false;

    // Convert run.pace to number (it might come as a string from JSON)
    const runPace = typeof run.pace === 'number' ? run.pace : parseInt(run.pace, 10);
    if (isNaN(runPace)) return false;

    const min = paceMin ? paceToSeconds(paceMin) : null;
    const max = paceMax ? paceToSeconds(paceMax) : null;

    if (min === null && max === null) return true;
    if (min === null) return runPace <= max;
    if (max === null) return runPace >= min;
    return runPace >= min && runPace <= max;
  });
};

/**
 * Filters runs by date range
 * @param {Array} runs - Array of run objects
 * @param {string} dateFrom - Start date in ISO format (YYYY-MM-DD)
 * @param {string} dateTo - End date in ISO format (YYYY-MM-DD)
 * @returns {Array} Filtered runs array
 */
export const filterByDateRange = (runs, dateFrom, dateTo) => {
  if (!dateFrom && !dateTo) return runs;

  return runs.filter((run) => {
    if (!run.date) return false;

    if (dateFrom && dateTo) {
      return run.date >= dateFrom && run.date <= dateTo;
    } else if (dateFrom) {
      return run.date >= dateFrom;
    } else if (dateTo) {
      return run.date <= dateTo;
    }
    return true;
  });
};

/**
 * Filters runs by leader name using fuzzy search
 * @param {Array} runs - Array of run objects
 * @param {string} searchLeader - Search term for leader name
 * @returns {Array} Filtered and sorted runs array (by relevance)
 */
export const filterByLeaderName = (runs, searchLeader) => {
  if (!searchLeader || !searchLeader.trim()) return runs;

  const leaderSearch = searchLeader.trim();
  const searcher = new FuzzySearch(runs, ['leader_name', 'leader_first_name', 'leader_last_name'], {
    caseSensitive: false,
    sort: true,
  });

  return searcher.search(leaderSearch);
};

/**
 * Filters runs by run name using fuzzy search
 * @param {Array} runs - Array of run objects
 * @param {string} searchName - Search term for run name
 * @returns {Array} Filtered and sorted runs array (by relevance)
 */
export const filterByRunName = (runs, searchName) => {
  if (!searchName || !searchName.trim()) return runs;

  const nameSearch = searchName.trim();
  const searcher = new FuzzySearch(runs, ['name'], {
    caseSensitive: false,
    sort: true,
  });

  return searcher.search(nameSearch);
};

/**
 * Filters runs by location using fuzzy search
 * @param {Array} runs - Array of run objects
 * @param {string} searchLocation - Search term for location
 * @returns {Array} Filtered and sorted runs array (by relevance)
 */
export const filterByLocation = (runs, searchLocation) => {
  if (!searchLocation || !searchLocation.trim()) return runs;

  const locationSearch = searchLocation.trim();
  const searcher = new FuzzySearch(runs, ['start_address', 'end_address'], {
    caseSensitive: false,
    sort: true,
  });

  return searcher.search(locationSearch);
};

