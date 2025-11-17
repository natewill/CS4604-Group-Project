// Generate Google Static Maps API URL
export const getStaticMapUrl = (run) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const size = "800x600";
  
  // Calculate bounds to ensure entire polyline fits
  const minLat = Math.min(run.start_lat, run.end_lat);
  const maxLat = Math.max(run.start_lat, run.end_lat);
  const minLng = Math.min(run.start_lng, run.end_lng);
  const maxLng = Math.max(run.start_lng, run.end_lng);
  
  // Add padding to bounds (about 10% on each side)
  const latPadding = (maxLat - minLat) * 0.1 || 0.01;
  const lngPadding = (maxLng - minLng) * 0.1 || 0.01;
  
  const visibleBounds = `${minLat - latPadding},${minLng - lngPadding}|${maxLat + latPadding},${maxLng + lngPadding}`;
  
  return (
    `https://maps.googleapis.com/maps/api/staticmap?` +
    `path=enc:${run.polyline}&` +
    `size=${size}&` +
    `visible=${visibleBounds}&` +
    `style=feature:poi|visibility:off&` +
    `markers=color:0x10b981|label:S|${run.start_lat},${run.start_lng}&` +
    `markers=color:0xef4444|label:E|${run.end_lat},${run.end_lng}&` +
    `key=${apiKey}`
  );
};

