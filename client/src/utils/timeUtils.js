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