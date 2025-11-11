import { addEndpoints } from "./addEndpoints";

// Line in the directions
export const polylineOptions = {
  strokeColor: "#2563eb",
  strokeOpacity: 1,
  strokeWeight: 6,
};

// This function extracts the start and end coordinates from a DirectionResults
// returned by the Google Directions API
export function extractLegEndpoints(directions) {
  try {
    const leg = directions?.routes?.[0]?.legs?.[0];
    if (!leg) return null;

    return {
      start: { lat: leg.start_location.lat(), lng: leg.start_location.lng() },
      end: { lat: leg.end_location.lat(), lng: leg.end_location.lng() },
    };
  } catch (_) {
    return null;
  }
}

// Uses Google Directions API to request a route between origin and destination
export function requestDirections({ origin, destination }) {
  return new Promise((resolve, reject) => {
    const g = window.google;
    if (!g || !g.maps) return reject(new Error("Google Maps not loaded"));

    // Create instance of DirectionsService
    const service = new g.maps.DirectionsService();
    // We pass origin and destination and (lat, long)
    // Then we define a callback
    service.route(
      {
        origin,
        destination,
        travelMode: "WALKING",
      },
      async (result, status) => {

        //rewrite polyline to include start and end points
        result.routes[0].overview_polyline = await addEndpoints(result.routes[0].overview_polyline, origin.lat, origin.lng, destination.lat, destination.lng);

        if (status === "OK") resolve(result);
        else reject(new Error(`Directions request failed: ${status}`));
      }
    );
  });
}
