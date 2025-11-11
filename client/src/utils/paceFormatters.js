/**
 * Helper function to format pace (seconds) to "MM:SS" for display
 * @param {number} paceSeconds - Pace in seconds
 * @returns {string} Formatted pace string in "MM:SS" format
 */
export const formatPace = (paceSeconds) => {
  if (paceSeconds === null || paceSeconds === undefined) return '';
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = paceSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Helper function to convert "MM:SS" format to total seconds
 * @param {string} paceStr - Pace string in "MM:SS" format
 * @returns {number|null} Total seconds or null if invalid
 */
export const paceToSeconds = (paceStr) => {
  if (!paceStr || typeof paceStr !== 'string') return null;
  if (paceStr.includes(':')) {
    const parts = paceStr.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      if (!isNaN(minutes) && !isNaN(seconds)) {
        return minutes * 60 + seconds;
      }
    }
  }
  return null;
};

