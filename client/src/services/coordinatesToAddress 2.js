import { getDistance } from 'geolib';

export async function coordinatesToAddress(lat, lng) {
  // We do API call on the server
  const response = await fetch(
    `/api/reverse-geocode?lat=${encodeURIComponent(
      lat
    )}&lng=${encodeURIComponent(lng)}`
  );

  // API return json object
  const data = await response.json();

  if (data.status === "OK" && data.results.length > 0) {
    const result = data.results[0];

    result.latitude = result.geometry.location.lat;
    result.longitude = result.geometry.location.lng;


    const within30meters = within30metersfunction(lat, lng, result) ? true : false;

    return {
      within30meters,
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
    };
  } else {
    console.error("Reverse geocoding failed:", data.status, data.error_message);
    return null;
  }
}
