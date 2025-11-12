import React, { useState, useEffect } from "react";
import StartTimePicker from "../components/StartTimePicker";
import PaceSlider from "../components/PaceSlider";
import { useNavigate } from "react-router-dom";
import CreateRoute from "./CreateRoute";
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import polyline from "@mapbox/polyline";
import { useAuth } from "../context/AuthContext";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

function NewRun() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState({
    run_route: "",
    run_status_id: 1,
    name: "",
    description: "",
    pace: "",
    date: "",
    start_time: "",
  });
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [creatingRoute, setCreatingRoute] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places", "geometry"],
  });

  // Redirect non-leaders
  useEffect(() => {
    if (!loading) {
      if (!user || (user.is_leader !== 1 && user.is_leader !== true)) {
        navigate("/runfinder");
      }
    }
  }, [user, loading, navigate]);

  // Fetch available routes
  useEffect(() => {
    fetch("/api/routes")
      .then((res) => res.json())
      .then((data) => setRoutes(data))
      .catch((err) => console.error("Failed to fetch routes:", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchRouteDetails = async (routeId) => {
    try {
      const res = await fetch(`/api/routes/${routeId}`);
      if (!res.ok) throw new Error("Failed to fetch route details");
      const data = await res.json();
      setSelectedRoute(data);
    } catch (err) {
      console.error(err);
      setSelectedRoute(null);
    }
  };

  const validateForm = () => {
    const missingFields = [];

    if (!form.run_route) missingFields.push("Route");
    if (!form.name.trim()) missingFields.push("Name");
    if (!form.pace) missingFields.push("Pace");
    if (!form.date) missingFields.push("Date");
    if (!form.start_time) missingFields.push("Start Time");
    if (!form.run_status_id) missingFields.push("Status");

    return missingFields;
  };

  const isFormComplete =
    form.run_route &&
    form.name.trim() &&
    form.pace &&
    form.date &&
    form.start_time &&
    form.run_status_id;

  const handleSubmit = (e) => {
    e.preventDefault();
    const missing = validateForm();
    if (missing.length > 0) {
      alert(
        `Please complete all required fields before creating the run:\n\n${missing.join(
          ", "
        )}`
      );
      return;
    }

    fetch("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create run");
        return res.json();
      })
      .then(() => {
        alert("Run created successfully!");
        navigate("/runfinder");
      })
      .catch((err) => {
        console.error(err);
        alert("Error creating run.");
      });
  };

  if (loading) return <p>Loading...</p>;

  if (!user || (user.is_leader !== 1 && user.is_leader !== true)) {
    navigate("/runfinder");
    return <p>Access denied. Only leaders can create new runs.</p>;
  }

  return (
    <div
      style={{
        padding: "2rem",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem 2.5rem",
          borderRadius: "16px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "800px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#3f51b5",
            marginBottom: "1.5rem",
          }}
        >
          Create New Run
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Route Section */}
          <div
            style={{
              background: "#f9f9ff",
              padding: "1rem",
              borderRadius: "8px",
            }}
          >
            <label style={styles.label}>Route</label>
            {creatingRoute ? (
              <div>
                <h3 style={{ color: "#3f51b5" }}>Create a New Route</h3>
                <CreateRoute
                  onRouteCreated={(routeId) => {
                    setForm((prev) => ({ ...prev, run_route: routeId }));
                    setCreatingRoute(false);
                    fetchRouteDetails(routeId);
                    alert(`New route created! Route #${routeId} selected.`);
                  }}
                />
              </div>
            ) : (
              <>
                <select
                  name="run_route"
                  value={form.run_route || ""}
                  onChange={(e) => {
                    handleChange(e);
                    const routeId = e.target.value;
                    if (routeId) fetchRouteDetails(routeId);
                  }}
                  style={styles.select}
                >
                  <option value="">Select an existing route</option>
                  {routes.map((route) => {
                    let displayName = `Route #${route.route_id} (${route.distance} mi)`;
                    if (route.start_address)
                      displayName += `, Start: ${route.start_address}`;
                    if (route.end_address)
                      displayName += `, End: ${route.end_address}`;
                    return (
                      <option key={route.route_id} value={route.route_id}>
                        {displayName}
                      </option>
                    );
                  })}
                </select>

                <button
                  type="button"
                  onClick={() => setCreatingRoute(true)}
                  style={styles.secondaryButton}
                >
                  + Create New Route
                </button>
              </>
            )}
          </div>

          {/* Map Preview */}
          {isLoaded && selectedRoute && (
            <div
              style={{
                height: "400px",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={{
                  lat: parseFloat(selectedRoute.start_lat || 37.23),
                  lng: parseFloat(selectedRoute.start_lng || -80.42),
                }}
                zoom={13}
              >
                <Marker
                  position={{
                    lat: parseFloat(selectedRoute.start_lat),
                    lng: parseFloat(selectedRoute.start_lng),
                  }}
                  label="Start"
                />
                <Marker
                  position={{
                    lat: parseFloat(selectedRoute.end_lat),
                    lng: parseFloat(selectedRoute.end_lng),
                  }}
                  label="End"
                />
                {selectedRoute.polyline && (
                  <Polyline
                    path={polyline
                      .decode(selectedRoute.polyline)
                      .map(([lat, lng]) => ({ lat, lng }))}
                    options={{
                      strokeColor: "#ff4081",
                      strokeWeight: 4,
                    }}
                  />
                )}
              </GoogleMap>
            </div>
          )}

          {/* Other Fields */}
          <div style={styles.row}>
            <div style={styles.column}>
              <label style={styles.label}>Status</label>
              <select
                name="run_status_id"
                value={form.run_status_id}
                onChange={handleChange}
                style={styles.select}
              >
                <option value={1}>Scheduled</option>
                <option value={2}>Completed</option>
                <option value={3}>Cancelled</option>
                <option value={4}>In Progress</option>
              </select>
            </div>

            <PaceSlider
              label="Pace (min:sec per mile)"
              value={form.pace}
              defaultValue={480}
              onChange={(newPace) =>
                setForm((prev) => ({ ...prev, pace: newPace }))
              }
            />
          </div>

          <label style={styles.label}>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            style={styles.textarea}
          />

          <div style={styles.row}>
            <div style={styles.column}>
              <label style={styles.label}>Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <StartTimePicker form={form} setForm={setForm} styles={styles} />
          </div>

          <button
            type="submit"
            style={{
              ...styles.primaryButton,
              opacity: isFormComplete ? 1 : 0.6,
              cursor: isFormComplete ? "pointer" : "not-allowed",
            }}
            disabled={!isFormComplete}
          >
            Create Run
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  label: {
    fontWeight: "600",
    color: "#333",
    display: "block",
    marginBottom: "0.25rem",
  },
  input: {
    width: "100%",
    padding: "0.6rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
    transition: "0.2s",
  },
  select: {
    width: "100%",
    padding: "0.6rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
    transition: "0.2s",
  },
  textarea: {
    width: "100%",
    padding: "0.6rem",
    minHeight: "80px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
  },
  primaryButton: {
    backgroundColor: "#3f51b5",
    color: "white",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginTop: "1rem",
    fontWeight: "bold",
    fontSize: "1rem",
    transition: "0.3s",
  },
  secondaryButton: {
    backgroundColor: "#e0e0ff",
    color: "#3f51b5",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
    marginTop: "0.5rem",
    transition: "0.2s",
  },
  row: {
    display: "flex",
    gap: "1rem",
  },
  column: {
    flex: 1,
  },
};

export default NewRun;
