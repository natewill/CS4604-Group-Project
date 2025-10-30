//Using
//Maps Javascript API (this is to display the map)
//Route API (This is to generate route)
//Geocoding API (convert between address and coordinates)
//Address validation API (validates addresses)

import React, { useRef, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
  Autocomplete,
} from "@react-google-maps/api";
import { validateAddress } from "./api/validateAddress";
import { addressToCoordinates } from "./api/addressToCoordinates";
import { coordinatesToAddress } from "./api/coordinatesToAddress";
import { routeSave } from "./api/routeSave";
import { buildIcons } from "./map/icons";
import {
  requestDirections,
  extractLegEndpoints,
  polylineOptions,
} from "./map/directions";

const libraries = ["places", "geometry"];
const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const CreateRoute = () => {
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [directions, setDirections] = useState(null);
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [activePick, setActivePick] = useState(null); // 'start' | 'end' | null
  const [routeStart, setRouteStart] = useState(null);
  const [routeEnd, setRouteEnd] = useState(null);
  const [customIcons, setCustomIcons] = useState(null);
  const startAutocompleteRef = useRef(null);
  const endAutocompleteRef = useRef(null);
  const directionsRendererRef = useRef(null);

  const initialCenter = { lat: 37.2296, lng: -80.4139 }; // Blacksburg, VA
  const [mapCenter, setMapCenter] = useState(initialCenter);

  // Generate walking route using DirectionsService
  const generateRoute = async () => {
    // Validate Starting and Ending Location
    const startValid = await validateAddress(startAddress);
    const endValid = await validateAddress(endAddress);
    if (!startValid || !endValid) {
      // Just warn but do not prohibit route generation based off invalid loco
      console.warn(
        "Address validation failed; proceeding with routing using geocoding."
      );
    }

    // Convert address to Coordinates if necessary
    const originCoords =
      startCoords || (await addressToCoordinates(startAddress));
    const destCoords = endCoords || (await addressToCoordinates(endAddress));

    try {
      const result = await requestDirections({
        origin: originCoords,
        destination: destCoords,
      });
      setDirections(result);

      // Clear temporary pick markers once route is rendered
      setStartCoords(null);
      setEndCoords(null);

      // Given the route grab the start and end (long, lat)
      const endpoints = extractLegEndpoints(result);
      if (endpoints) {
        setRouteStart(endpoints.start);
        setRouteEnd(endpoints.end);
      }
    } catch (_) {
      alert("Could not generate route.");
    }
  };

  // Call client side routeSave which calls server to attempt to insert
  // routeData as a new Route
  const saveRoute = async () => {
    // We check directions, routeStart, and routeEnd in the button
    // so we know these all have values
    const routeData = {
      start_lat: routeStart.lat,
      start_lng: routeStart.lng,
      end_lat: routeEnd.lat,
      end_lng: routeEnd.lng,
      polyline: directions.routes[0].overview_polyline,
      distance: directions.routes[0].legs[0].distance.value / 1609.344,
    };

    try {
      await routeSave(routeData);
      alert("Route saved successfully!");
    } catch (err) {
      alert("Failed to save route.");
    }
  };

  const loadIcons = () => {
    const icons = buildIcons(window.google);
    if (icons) setCustomIcons(icons);
  };

  const clickGoogleMap = async (e) => {
    if (!activePick) return;
    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();
    if (lat == null || lng == null) return;
    const reverse = await coordinatesToAddress(lat, lng);
    if (reverse) {
      if (activePick === "start") {
        const coords = { lat, lng };
        setStartCoords(coords);
        setMapCenter(coords);
        setStartAddress(reverse.formattedAddress);
      } else if (activePick === "end") {
        const coords = { lat, lng };
        setEndCoords(coords);
        setEndAddress(reverse.formattedAddress);
      }
      setActivePick(null);
    }
  };

  const directionsChanged = () => {
    const updated = directionsRendererRef.current?.getDirections?.();
    if (updated) {
      try {
        const leg = updated?.routes?.[0]?.legs?.[0];
        if (leg?.start_location && leg?.end_location) {
          setRouteStart({
            lat: leg.start_location.lat(),
            lng: leg.start_location.lng(),
          });
          setRouteEnd({
            lat: leg.end_location.lat(),
            lng: leg.end_location.lng(),
          });
        }
      } catch (_) {
        // ignore
      }
    }
  };

  const startLocationChanged = () => {
    const place = startAutocompleteRef.current?.getPlace?.();
    if (place?.formatted_address) {
      const addr = place.formatted_address;
      setStartAddress(addr);
      (async () => {
        const coords = await addressToCoordinates(addr);
        if (coords) {
          setStartCoords(coords);
          setMapCenter(coords);
        }
      })();
    }
  };

  const endLocationChanged = () => {
    const place = endAutocompleteRef.current?.getPlace?.();
    if (place?.formatted_address) setEndAddress(place.formatted_address);
  };

  return (
    <div>
      <h2>Create Run</h2>

      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        libraries={libraries}
      >
        <div style={{ marginBottom: "10px" }}>
          <Autocomplete
            onLoad={(ref) => (startAutocompleteRef.current = ref)}
            onPlaceChanged={startLocationChanged}
          >
            <input
              type="text"
              placeholder="Start location"
              value={startAddress}
              onChange={(e) => setStartAddress(e.target.value)}
              style={{ width: "600px", marginRight: "10px" }}
            />
          </Autocomplete>
          <Autocomplete
            onLoad={(ref) => (endAutocompleteRef.current = ref)}
            onPlaceChanged={endLocationChanged}
          >
            <input
              type="text"
              placeholder="End location"
              value={endAddress}
              onChange={(e) => setEndAddress(e.target.value)}
              style={{ width: "600px" }}
            />
          </Autocomplete>
          <button onClick={generateRoute} style={{ marginLeft: "10px" }}>
            Generate Route
          </button>
          <button
            onClick={() => setActivePick("start")}
            style={{ marginLeft: "10px" }}
          >
            Pick Start on Map
          </button>
          <button
            onClick={() => setActivePick("end")}
            style={{ marginLeft: "10px" }}
          >
            Pick End on Map
          </button>
          <button
            onClick={saveRoute}
            style={{ marginLeft: "10px" }}
            disabled={!directions || !routeStart || !routeEnd}
          >
            Save Route
          </button>
        </div>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={13}
          mapTypeId="satellite"
          options={{
            streetViewControl: false,
            fullscreenControl: false,
            rotateControl: false,
            tilt: 0,
            heading: 0,
          }}
          onLoad={loadIcons}
          onClick={clickGoogleMap}
        >
          {startCoords && <Marker position={startCoords} />}
          {endCoords && <Marker position={endCoords} />}
          {directions && (
            <DirectionsRenderer
              onLoad={(renderer) => (directionsRendererRef.current = renderer)}
              onDirectionsChanged={directionsChanged}
              directions={directions}
              options={{
                suppressMarkers: true,
                draggable: true,
                polylineOptions,
              }}
            />
          )}
          {routeStart && (
            <Marker
              position={routeStart}
              title="Start"
              icon={customIcons?.startIcon}
            />
          )}
          {routeEnd && (
            <Marker
              position={routeEnd}
              title="End"
              icon={customIcons?.endIcon}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default CreateRoute;
