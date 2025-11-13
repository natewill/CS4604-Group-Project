import { addEndpoints } from "./addEndpoints";

// Line in the directions
export const polylineOptions = {
  strokeColor: "#2563eb",
  strokeOpacity: 1,
  strokeWeight: 6,
};

// Extracts the first & last coordinate of the FIRST LEG
export function extractLegEndpoints(directions) {
  try {
    const legs = directions?.routes?.[0]?.legs;
    if (!legs || legs.length === 0) return null;

    const firstLeg = legs[0];
    const lastLeg = legs[legs.length - 1];

    return {
      start: {
        lat: firstLeg.start_location.lat(),
        lng: firstLeg.start_location.lng(),
      },
      end: {
        lat: lastLeg.end_location.lat(),
        lng: lastLeg.end_location.lng(),
      },
    };
  } catch (_) {
    return null;
  }
}

/**
 * Request Google Directions
 *
 * Accepts:
 *   origin: {lat, lng}
 *   destination: {lat, lng}
 *   waypoint: optional turnaround {lat, lng}
 *
 * If waypoint is provided:
 *   - Generates a loop route (origin → waypoint → origin)
 */
export function requestDirections({ origin, destination, waypoint = null }) {
  return new Promise((resolve, reject) => {
    const g = window.google;
    if (!g || !g.maps) return reject(new Error("Google Maps not loaded"));

    const service = new g.maps.DirectionsService();

    // Build request object
    const request = {
      origin,
      destination,
      travelMode: "WALKING",
    };

    // If loop mode is active, add turnaround waypoint
    if (waypoint) {
      request.waypoints = [
        {
          location: waypoint,
          stopover: false,
        },
      ];
      request.optimizeWaypoints = false;
    }

    service.route(request, async (result, status) => {
      if (status !== "OK") {
        return reject(new Error(`Directions request failed: ${status}`));
      }

      // Rewrite polyline to include exact endpoints
      result.routes[0].overview_polyline = await addEndpoints(
        result.routes[0].overview_polyline,
        origin.lat,
        origin.lng,
        destination.lat,
        destination.lng
      );

      resolve(result);
    });
  });
}
