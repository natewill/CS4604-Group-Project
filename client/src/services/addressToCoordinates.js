// Uses Google Maps Geocoding API
// Used to convert street addresses to coordinates (long, Lat) and other info

export async function addressToCoordinates(address) {
  // We do API call on server side
  const response = await fetch(
    `/api/geocode?address=${encodeURIComponent(address)}`
  );

  // API response
  const data = await response.json();

  if (data.status === "OK" && data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return {
      lat: location.lat,
      lng: location.lng,
    };
  } else {
    console.error("Geocoding failed:", data.status, data.error_message);
    return null;
  }
}

