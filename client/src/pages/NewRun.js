import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateRoute from "./CreateRoute"; // ✅ import your existing route creator
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import polyline from "@mapbox/polyline";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

function NewRun() {
    const [routes, setRoutes] = useState([]);
    const [form, setForm] = useState({
        leader_id: "",
        run_route: "",
        run_status_id: 1,
        name: "",
        description: "",
        pace: "",
        date: "",
        start_time: "",
    });
    const [showCreateRoute, setShowCreateRoute] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [leaders, setLeaders] = useState([]);
    const [newRouteId, setNewRouteId] = useState(null);
    const [creatingRoute, setCreatingRoute] = useState(false);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries: ["places", "geometry"], // ✅ required for Autocomplete & directions
    });


    const navigate = useNavigate();

    // Load existing routes
    useEffect(() => {
        fetch("/api/routes")
            .then((res) => res.json())
            .then((data) => setRoutes(data))
            .catch((err) => console.error("Failed to fetch routes:", err));
        fetch("/api/leaders")
            .then((res) => res.json())
            .then((data) => setLeaders(data))
            .catch((err) => console.error("Failed to fetch leaders:", err));
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRouteSelect = (e) => {
        const routeId = e.target.value;
        setForm({ ...form, run_route: routeId });
        const route = routes.find((r) => r.route_id === Number(routeId));
        setSelectedRoute(route || null);
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

    const handleSubmit = (e) => {
        e.preventDefault();
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
                navigate("/runs");
            })
            .catch((err) => {
                console.error(err);
                alert("Error creating run.");
            });
    };

    // When CreateRoute finishes creating a route in DB, refresh list and select it
    const handleRouteCreated = (newRouteId) => {
        fetch("/api/routes")
            .then((res) => res.json())
            .then((data) => {
                setRoutes(data);
                const newRoute = data.find((r) => r.route_id === newRouteId);
                setForm({ ...form, run_route: newRouteId });
                setSelectedRoute(newRoute || null);
                setShowCreateRoute(false);
            })
            .catch((err) => console.error("Failed to refresh routes:", err));
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
            <h1>Create New Run</h1>

            <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
                <label>
                    Leader:
                    <select
                        name="leader_id"
                        value={form.leader_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a leader</option>
                        {leaders.map((leader) => (
                            <option key={leader.runner_id} value={leader.runner_id}>
                                {leader.full_name} ({leader.email})
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Route:
                    {creatingRoute ? (
                        <div>
                            <h3>Create a New Route</h3>
                            <CreateRoute
                                onRouteCreated={(routeId) => {
                                    setNewRouteId(routeId);
                                    setForm((prev) => ({ ...prev, run_route: routeId }));
                                    setCreatingRoute(false);
                                    fetchRouteDetails(routeId); // Fetch & display preview
                                    alert(`New route created! Route #${routeId} selected.`);
                                }}
                            />
                        </div>
                    ) : (
                        <>
                            <label>
                                Select Existing Route:
                                <select
                                    name="run_route"
                                    value={form.run_route || ""}
                                    onChange={(e) => {
                                        handleChange(e);
                                        const routeId = e.target.value;
                                        if (routeId) fetchRouteDetails(routeId);
                                    }}
                                >
                                    <option value="">Select a route</option>
                                    {routes.map((route) => (
                                        <option key={route.route_id} value={route.route_id}>
                                            Route #{route.route_id} ({route.distance} mi)
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <button
                                type="button"
                                onClick={() => setCreatingRoute(true)}
                                style={{ marginTop: "1rem" }}
                            >
                                + Create New Route
                            </button>
                        </>
                    )}

                </label>

                {isLoaded && selectedRoute && (
                    <div style={{ height: "400px", marginTop: "1rem" }}>
                        <GoogleMap
                            mapContainerStyle={{ width: "100%", height: "100%" }}
                            center={{
                                lat: parseFloat(selectedRoute.start_lat || 37.23),
                                lng: parseFloat(selectedRoute.start_lng || -80.42),
                            }}
                            zoom={13}
                        >
                            {/* Start Marker */}
                            <Marker
                                position={{
                                    lat: parseFloat(selectedRoute.start_lat),
                                    lng: parseFloat(selectedRoute.start_lng),
                                }}
                                label="Start"
                            />

                            {/* End Marker */}
                            <Marker
                                position={{
                                    lat: parseFloat(selectedRoute.end_lat),
                                    lng: parseFloat(selectedRoute.end_lng),
                                }}
                                label="End"
                            />

                            {/* Polyline if available */}
                            {selectedRoute.polyline && (
                                <Polyline
                                    path={polyline.decode(selectedRoute.polyline).map(([lat, lng]) => ({
                                        lat,
                                        lng,
                                    }))}
                                    options={{
                                        strokeColor: "#FF0000",
                                        strokeWeight: 4,
                                    }}
                                />
                            )}
                        </GoogleMap>
                    </div>
                )}


                <label>
                    Status:
                    <select
                        name="run_status_id"
                        value={form.run_status_id}
                        onChange={handleChange}
                    >
                        <option value={1}>Scheduled</option>
                        <option value={2}>Completed</option>
                        <option value={3}>Cancelled</option>
                        <option value={4}>In Progress</option>
                    </select>
                </label>

                <label>
                    Name:
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Description:
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    Pace (e.g., 08:30):
                    <input
                        type="text"
                        name="pace"
                        value={form.pace}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Date:
                    <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Start Time:
                    <input
                        type="time"
                        name="start_time"
                        value={form.start_time}
                        onChange={handleChange}
                        required
                    />
                </label>

                <button
                    type="submit"
                    style={{
                        backgroundColor: "#4CAF50",
                        color: "white",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        marginTop: "1rem",
                    }}
                >
                    Create Run
                </button>
            </form>
        </div>
    );
}

export default NewRun;
