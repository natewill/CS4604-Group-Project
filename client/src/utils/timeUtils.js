// Converts 12-hour time (hour, minute, ampm) to a 24-hour string ("HH:MM")
export function convertTo24Hour(hour, minute, ampm) {
  let hour24 = ampm === "PM"
    ? hour === 12
      ? 12
      : hour + 12
    : hour === 12
    ? 0
    : hour;
  return `${hour24.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
}

// Converts 24-hour time string ("HH:MM") to 12-hour format ("h:mm AM/PM")
// Also handles already-formatted AM/PM strings by returning them as-is
export function convertTo12Hour(timeString) {
  if (!timeString) return '';
  
  // If already in 12-hour format (contains AM/PM), return as-is
  if (typeof timeString === 'string' && (timeString.includes('AM') || timeString.includes('PM'))) {
    return timeString;
  }
  
  // Parse 24-hour format
  const [hours, minutes] = timeString.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return timeString;
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}