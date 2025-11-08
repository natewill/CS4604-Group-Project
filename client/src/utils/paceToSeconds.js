// Helper function to convert "MM:SS" format to total seconds
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

