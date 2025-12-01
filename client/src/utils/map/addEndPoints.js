/**
 * Adds start and end points to a decoded polyline
 * @param {string} decodedPolyline - Encoded polyline string
 * @param {number} start_lat - Start latitude
 * @param {number} start_lng - Start longitude
 * @param {number} end_lat - End latitude
 * @param {number} end_lng - End longitude
 * @returns {string} Encoded polyline string with start and end points added
 */
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

