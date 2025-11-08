export async function addEndpoints(decodedPolyline, start_lat, start_lng, end_lat, end_lng) {
    const g = window.google;
    
    if (!g || !g.maps) {
        throw new Error("Google Maps not loaded");
    }

    const path = g.maps.geometry.encoding.decodePath(decodedPolyline);
    const start = new g.maps.LatLng(start_lat, start_lng);
    const end = new g.maps.LatLng(end_lat, end_lng);

    // insert at beginning (index 0)
    path.unshift(start); // insert at the beginning
    path.push(end); // append at the end
    
    return g.maps.geometry.encoding.encodePath(path); //encode the patharray as a string
}

