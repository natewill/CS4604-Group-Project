// Helper function to parse formatted date string to Date object
// Format is "Month DD, YYYY" (e.g., "January 01, 2026")
export const parseFormattedDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

