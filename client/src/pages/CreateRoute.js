import React, { useRef, useState, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Autocomplete,
  useJsApiLoader,
  Polyline,
} from "@react-google-maps/api";
import { coordinatesToAddress } from "../services/geocoding";
import { routeSave } from "../services/routeSave";
import { buildIcons } from "../utils/map/icons";
import {
  requestDirections,
  extractLegEndpoints,
  polylineOptions,
} from "../utils/map/directions";
import validator from "validator";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const CreateRoute = ({ onRouteCreated }) => {
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [turnaroundCoords, setTurnaroundCoords] = useState(null);

  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [turnaroundAddress, setTurnaroundAddress] = useState("");

  const [isLoop, setIsLoop] = useState(false);
  const [activePick, setActivePick] = useState(null);

  const [directions, setDirections] = useState(null);
  const [routeStart, setRouteStart] = useState(null);
  const [routeEnd, setRouteEnd] = useState(null);
  const [customIcons, setCustomIcons] = useState(null);

  const initialCenter = { lat: 37.2296, lng: -80.4139 };
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const mapRef = useRef(null);
  const startAutocompleteRef = useRef(null);
  const endAutocompleteRef = useRef(null);
  const turnAutocompleteRef = useRef(null);

  // ---------------------- ROUTE GENERATION ----------------------
  const generateRoute = async () => {
    if (!startCoords) return;
    try {
      let result;

      if (isLoop && turnaroundCoords) {
        // LOOP: Start → Turnaround → Start
        result = await requestDirections({
          origin: startCoords,
          destination: startCoords,
          waypoint: turnaroundCoords,
        });
      } else if (!isLoop && endCoords) {
        // NORMAL ROUTE
        result = await requestDirections({
          origin: startCoords,
          destination: endCoords,
        });
      } else {
        return;
      }

      setDirections(result);

      const endpoints = extractLegEndpoints(result);
      if (endpoints) {
        setRouteStart(endpoints.start);
        setRouteEnd(endpoints.end);
      }
    } catch (e) {
      console.error("generateRoute error:", e);
      alert("Could not generate route.");
    }
  };

  // ---------------------- SAVE ROUTE ----------------------
  const saveRoute = async () => {
    if (!directions) {
      alert("Please generate a route first.");
      return;
    }

    const totalMeters = directions.routes[0].legs.reduce(
      (sum, leg) => sum + leg.distance.value,
      0
    );

    const routeData = {
      start_lat: startCoords.lat,
      start_lng: startCoords.lng,
      end_lat: isLoop ? startCoords.lat : endCoords?.lat,
      end_lng: isLoop ? startCoords.lng : endCoords?.lng,

      start_address: validator.isLatLong(startAddress || "")
        ? null
        : startAddress,
      end_address: validator.isLatLong(endAddress || "") ? null : endAddress,

      turnaround_lat: isLoop ? turnaroundCoords.lat : null,
      turnaround_lng: isLoop ? turnaroundCoords.lng : null,

      polyline: directions.routes[0].overview_polyline,
      distance: totalMeters / 1609.344,
    };

    try {
      const result = await routeSave(routeData);
      if (result?.route_id) {
        alert(`Route saved! Route ID: ${result.route_id}`);
        if (onRouteCreated) onRouteCreated(result.route_id);
      }
    } catch (err) {
      console.error("saveRoute error:", err);
      alert("Failed to save route.");
    }
  };

  // ---------------------- MAP CLICK HANDLER ----------------------
  const clickGoogleMap = async (e) => {
    if (!activePick) return;

    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();
    const coords = { lat, lng };

    const address = await coordinatesToAddress(lat, lng);
    const displayAddr = address?.within30meters
      ? address.formattedAddress
      : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    if (activePick === "start") {
      setStartCoords(coords);
      setStartAddress(displayAddr);

      if (isLoop) {
        const approx = { lat: lat + 0.015, lng };
        setTurnaroundCoords(approx);
        setTurnaroundAddress(`${approx.lat.toFixed(5)}, ${approx.lng.toFixed(5)}`);
      }
    } else if (activePick === "end") {
      setEndCoords(coords);
      setEndAddress(displayAddr);
    } else if (activePick === "turn") {
      setTurnaroundCoords(coords);
      setTurnaroundAddress(displayAddr);
    }

    setMapCenter(coords);
    setActivePick(null);
  };

  // ---------------------- AUTOCOMPLETE HANDLERS ----------------------
  const enteredStartLocation = () => {
    const place = startAutocompleteRef.current?.getPlace();
    if (!place?.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setStartCoords({ lat, lng });
    setStartAddress(place.formatted_address);

    if (isLoop) {
      const approx = { lat: lat + 0.015, lng };
      setTurnaroundCoords(approx);
      setTurnaroundAddress(`${approx.lat.toFixed(5)}, ${approx.lng.toFixed(5)}`);
    }

    setMapCenter({ lat, lng });
  };

  const enteredEndLocation = () => {
    const place = endAutocompleteRef.current?.getPlace();
    if (!place?.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setEndCoords({ lat, lng });
    setEndAddress(place.formatted_address);
  };

  const enteredTurnLocation = () => {
    const place = turnAutocompleteRef.current?.getPlace();
    if (!place?.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setTurnaroundCoords({ lat, lng });
    setTurnaroundAddress(place.formatted_address);
  };

  // ---------------------- AUTO GENERATE ROUTE ----------------------
  useEffect(() => {
    if (!isLoop && startCoords && endCoords) generateRoute();
    if (isLoop && startCoords && turnaroundCoords) generateRoute();
  }, [startCoords, endCoords, turnaroundCoords, isLoop]);

  // ---------------------- AUTO CENTER MAP IN LOOP MODE ----------------------
  useEffect(() => {
    if (!isLoop) return;
    if (!mapRef.current || !startCoords || !turnaroundCoords) return;

    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(startCoords);
    bounds.extend(turnaroundCoords);
    mapRef.current.fitBounds(bounds);
  }, [isLoop, startCoords, turnaroundCoords]);

  // ---------------------- GOOGLE MAPS LOADING ----------------------
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places", "geometry"],
  });

  if (!isLoaded) return <div>Loading Google Maps...</div>;

  return (
    <div style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px" }}>
      {/* LOOP CHECKBOX */}
      <label style={{ display: "block", marginBottom: "10px" }}>
        <input
          type="checkbox"
          checked={isLoop}
          onChange={(e) => {
            setIsLoop(e.target.checked);
            setDirections(null);
            if (e.target.checked) {
              setEndAddress("");
              setEndCoords(null);
            }
          }}
        />
        Make this route a LOOP (start and end at same location)
      </label>

      {/* INPUT FIELDS */}
      <Autocomplete
        onLoad={(ref) => (startAutocompleteRef.current = ref)}
        onPlaceChanged={enteredStartLocation}
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
        onPlaceChanged={enteredEndLocation}
      >
        <input
          type="text"
          placeholder="End location"
          disabled={isLoop}
          value={endAddress}
          onChange={(e) => setEndAddress(e.target.value)}
          style={{ width: "45%", opacity: isLoop ? 0.4 : 1 }}
        />
      </Autocomplete>

      {/* Turnaround point input for loop */}
      {isLoop && (
        <div style={{ marginTop: "10px" }}>
          <Autocomplete
            onLoad={(ref) => (turnAutocompleteRef.current = ref)}
            onPlaceChanged={enteredTurnLocation}
          >
            <input
              type="text"
              placeholder="Turnaround point"
              value={turnaroundAddress}
              onChange={(e) => setTurnaroundAddress(e.target.value)}
              style={{ width: "45%" }}
            />
          </Autocomplete>
        </div>
      )}

      {/* BUTTONS */}
      <div style={{ marginTop: "10px" }}>
        <button onClick={() => setActivePick("start")}>Pick Start on Map</button>

        {!isLoop && (
          <button
            onClick={() => setActivePick("end")}
            style={{ marginLeft: "10px" }}
          >
            Pick End on Map
          </button>
        )}

        {isLoop && (
          <button
            onClick={() => setActivePick("turn")}
            style={{ marginLeft: "10px" }}
          >
            Pick Turnaround on Map
          </button>
        )}

        <button
          onClick={saveRoute}
          style={{ marginLeft: "10px" }}
          disabled={!directions}
        >
          Save Route
        </button>
      </div>

      {/* MAP */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={13}
        onLoad={(map) => {
          mapRef.current = map;
          map.setMapTypeId("hybrid");
          setCustomIcons(buildIcons(window.google));
        }}
        options={{
          streetViewControl: false,
          fullscreenControl: false,
          draggableCursor: "default",
        }}
        onClick={clickGoogleMap}
      >
        {startCoords && (
          <Marker position={startCoords} icon={customIcons?.startIcon} />
        )}

        {!isLoop && endCoords && (
          <Marker position={endCoords} icon={customIcons?.endIcon} />
        )}

        {isLoop && turnaroundCoords && (
          <Marker position={turnaroundCoords} icon={customIcons?.turnaroundIcon} />
        )}

        {/* ALWAYS SHOW THE ROUTE LINE */}
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

        {/* CONNECTORS FOR NORMAL ROUTES ONLY */}
        {!isLoop && startCoords && routeStart && (
          <Polyline path={[startCoords, routeStart]} options={polylineOptions} />
        )}
        {!isLoop && endCoords && routeEnd && (
          <Polyline path={[endCoords, routeEnd]} options={polylineOptions} />
        )}
      </GoogleMap>
    </div>
  );
};

export default CreateRoute;
