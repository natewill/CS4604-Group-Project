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

// Converts 24-hour time string ("HH:MM" or "HH:MM:SS") to 12-hour AM/PM format
// Also handles already-formatted times (returns as-is)
export function convertTo12Hour(time24) {
  if (!time24) return "";
  
  // If already formatted with AM/PM, return as-is
  if (time24.includes("AM") || time24.includes("PM")) {
    return time24;
  }
  
  const [hours, minutes] = time24.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}