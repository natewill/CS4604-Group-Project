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

   const formattedAddress = result.formatted_address;
   const distance = getDistance({ latitude: lat, longitude: lng },
     { latitude: result.latitude, longitude: result.longitude });

   // Check if address starts with a plus code pattern (e.g., "77MX+RG Pearisburg, VA, USA")
   const isPlusCodeAddress = /^[A-Z0-9]{2,}\+[A-Z0-9]{2,}/i.test(result.formatted_address);
   const within30meters = !isPlusCodeAddress && distance <= 30;

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
