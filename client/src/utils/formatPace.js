// Helper function to format pace (seconds) to "MM:SS" for display
export const formatPace = (paceSeconds) => {
  if (paceSeconds === null || paceSeconds === undefined) return '';
  
  // If it's a number (seconds), convert to "MM:SS"
  if (typeof paceSeconds === 'number') {
    const minutes = Math.floor(paceSeconds / 60);
    const seconds = paceSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // If it's already a string, return as-is
  return String(paceSeconds);
};

