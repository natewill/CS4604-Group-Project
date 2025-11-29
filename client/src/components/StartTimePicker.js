import React from "react";
import { convertTo24Hour } from "../utils/timeUtils";

function StartTimePicker({ form, setForm, styles = {} }) {
  const updateTime = (hour, minute, ampm) => {
    const time24 = convertTo24Hour(hour, minute, ampm);
    setForm((prev) => ({
      ...prev,
      start_time: time24,
      start_time_hour: hour,
      start_time_minute: minute,
      start_time_ampm: ampm,
    }));
  };

  return (
    <div style={styles.column || {}}>
      <label style={styles.label || {}}>Start Time</label>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {/* Hour */}
        <select
          value={form.start_time_hour || ""}
          onChange={(e) =>
            updateTime(parseInt(e.target.value), form.start_time_minute || 0, form.start_time_ampm || "AM")
          }
          style={{ ...(styles.select || {}), width: "80px" }}
        >
          <option value="">Hr</option>
          {[...Array(12).keys()].map((h) => (
            <option key={h + 1} value={h + 1}>
              {h + 1}
            </option>
          ))}
        </select>

        {/* Minute */}
        <select
          value={form.start_time_minute || ""}
          onChange={(e) =>
            updateTime(form.start_time_hour || 12, parseInt(e.target.value), form.start_time_ampm || "AM")
          }
          style={{ ...(styles.select || {}), width: "80px" }}
        >
          <option value="">Min</option>
          {[...Array(60).keys()].map((m) => (
            <option key={m} value={m}>
              {m.toString().padStart(2, "0")}
            </option>
          ))}
        </select>

        {/* AM/PM */}
        <select
          value={form.start_time_ampm || "AM"}
          onChange={(e) =>
            updateTime(form.start_time_hour || 12, form.start_time_minute || 0, e.target.value)
          }
          style={{ ...(styles.select || {}), width: "80px" }}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>

      {form.start_time && (
        <small style={{ color: "#555" }}>
          Selected start time:{" "}
          {`${form.start_time_hour}:${(form.start_time_minute || 0)
            .toString()
            .padStart(2, "0")} ${form.start_time_ampm}`}
        </small>
      )}
    </div>
  );
}

export default StartTimePicker;
