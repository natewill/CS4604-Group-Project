import React, { useRef, useState } from "react";
import {
  GoogleMap,
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

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const CreateRoute = ({ onRouteCreated }) => {
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [directions, setDirections] = useState(null);
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [activePick, setActivePick] = useState(null);
  const [routeStart, setRouteStart] = useState(null);
  const [routeEnd, setRouteEnd] = useState(null);
  const [customIcons, setCustomIcons] = useState(null);

  const startAutocompleteRef = useRef(null);
  const endAutocompleteRef = useRef(null);
  const directionsRendererRef = useRef(null);

  const initialCenter = { lat: 37.2296, lng: -80.4139 }; // Blacksburg
  const [mapCenter, setMapCenter] = useState(initialCenter);

  // Generate route
  const generateRoute = async () => {
    const startValid = await validateAddress(startAddress);
    const endValid = await validateAddress(endAddress);
    if (!startValid || !endValid) {
      console.warn("Invalid address; continuing anyway.");
    }

    const originCoords =
      startCoords || (await addressToCoordinates(startAddress));
    const destCoords = endCoords || (await addressToCoordinates(endAddress));

    try {
      const result = await requestDirections({
        origin: originCoords,
        destination: destCoords,
      });
      setDirections(result);
      setStartCoords(null);
      setEndCoords(null);

      const endpoints = extractLegEndpoints(result);
      if (endpoints) {
        setRouteStart(endpoints.start);
        setRouteEnd(endpoints.end);
      }
    } catch (e) {
      alert("Could not generate route.");
    }
  };

  // Save route to DB
  const saveRoute = async () => {
    if (!directions || !routeStart || !routeEnd) {
      alert("Please generate a route first.");
      return;
    }

    const routeData = {
      start_lat: routeStart.lat,
      start_lng: routeStart.lng,
      end_lat: routeEnd.lat,
      end_lng: routeEnd.lng,
      polyline: directions.routes[0].overview_polyline,
      distance: directions.routes[0].legs[0].distance.value / 1609.344,
    };

    try {
      const result = await routeSave(routeData);
      if (result?.route_id) {
        alert(` Route saved! Route ID: ${result.route_id}`);
        if (onRouteCreated) onRouteCreated(result.route_id);
      } else {
        alert("Route saved, but no route_id returned.");
      }
    } catch (err) {
      console.error("saveRoute error:", err);
      alert(" Failed to save route.");
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
    const reverse = await coordinatesToAddress(lat, lng);
    if (reverse) {
      const coords = { lat, lng };
      if (activePick === "start") {
        setStartCoords(coords);
        setStartAddress(reverse.formattedAddress);
      } else {
        setEndCoords(coords);
        setEndAddress(reverse.formattedAddress);
      }
      setMapCenter(coords);
      setActivePick(null);
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
    <div style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px" }}>
      <h3>Create New Route</h3>

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
            style={{ width: "45%", marginRight: "10px" }}
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
            style={{ width: "45%" }}
          />
        </Autocomplete>
        <div style={{ marginTop: "10px" }}>
          <button onClick={generateRoute}>Generate Route</button>
          <button onClick={() => setActivePick("start")} style={{ marginLeft: "10px" }}>
            Pick Start on Map
          </button>
          <button onClick={() => setActivePick("end")} style={{ marginLeft: "10px" }}>
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
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={13}
        mapTypeId="roadmap"
        options={{
          streetViewControl: false,
          fullscreenControl: false,
        }}
        onLoad={loadIcons}
        onClick={clickGoogleMap}
      >
        {startCoords && <Marker position={startCoords} />}
        {endCoords && <Marker position={endCoords} />}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              draggable: true,
              polylineOptions,
            }}
          />
        )}
        {routeStart && (
          <Marker position={routeStart} title="Start" icon={customIcons?.startIcon} />
        )}
        {routeEnd && (
          <Marker position={routeEnd} title="End" icon={customIcons?.endIcon} />
        )}
      </GoogleMap>
    </div>
  );
};

export default CreateRoute;
