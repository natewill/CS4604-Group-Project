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
    return {
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
    };
  } else {
    console.error("Reverse geocoding failed:", data.status, data.error_message);
    return null;
  }
}
