// Helper function to convert pace (seconds INT) to minutes (decimal) for filtering
export const paceToMinutes = (pace) => {
  if (pace === null || pace === undefined || pace === '') return null;
  
  // Pace from database is always a number (seconds)
  if (typeof pace === 'number') {
    return pace / 60; // Convert seconds to minutes
  }
  
  return null;
};

