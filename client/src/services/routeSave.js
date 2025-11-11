import axios from "axios";

export async function routeSave(routeData) {
  try {
    const { data } = await axios.post("/api/save-route", routeData);
    return data; // contains { message: "Route saved successfully" }
  } catch (err) {
    console.error("routeSave error:", err.response?.data || err.message);
    throw err;
  }
}

