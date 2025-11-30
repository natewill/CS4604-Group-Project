import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatPace } from "../utils/paceFormatters";
import "../styles/Home.css";

// Minimal hero-style landing for authenticated users
function Home() {
  const { user, isLeader } = useAuth();
  const [scenic, setScenic] = useState([]);
  const [scenicIndex, setScenicIndex] = useState(0);
  const [scenicError, setScenicError] = useState(null);

  const formatPaceRange = (min, max) => {
    if (!min && !max) return "Pace preference not set";
    if (min && max) return `${formatPace(min)} - ${formatPace(max)} / mile`;
    if (min) return `Min pace: ${formatPace(min)} / mile`;
    if (max) return `Max pace: ${formatPace(max)} / mile`;
    return "Pace preference not set";
  };

  useEffect(() => {
    const loadScenic = async () => {
      setScenicError(null);
      const city = "Blacksburg, VA";
      try {
        const res = await fetch(
          `/api/scenic-photos?city=${encodeURIComponent(city)}&limit=6`
        );
        if (!res.ok) {
          throw new Error("No scenic spots found");
        }
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server error - scenic photos unavailable");
        }
        const data = await res.json();
        setScenic(data);
        setScenicIndex(0);
      } catch (err) {
        console.error("Failed to load scenic photos", err);
        setScenic([]);
        setScenicError(err.message);
      }
    };

    loadScenic();
  }, []);

  return (
    <div className="home-container">
      <div className="home-card">
        <div className="home-content">
          <div className="home-header">
            <div className="home-header-text">
              <div className="home-dashboard-label">Dashboard</div>
              <h1 className="home-welcome-title">
                Welcome, {user?.first_name || "Runner"}
              </h1>
              <p className="home-pace-info">
                {formatPaceRange(user?.min_pace, user?.max_pace)}
              </p>
            </div>
            <div className="home-distance-badge">
              {user?.min_dist_pref !== null &&
              user?.min_dist_pref !== undefined &&
              user?.max_dist_pref !== null &&
              user?.max_dist_pref !== undefined
                ? `${user.min_dist_pref}-${user.max_dist_pref} mi preference`
                : "Set your distance preferences"}
            </div>
          </div>

          <div className="home-actions">
            <Link to="/runfinder" className="home-action-primary">
              Find a run
            </Link>

            {isLeader ? (
              <>
                <Link to="/runs/new" className="home-action-secondary">
                  Plan a new run
                </Link>

                <Link to="/create-route" className="home-action-tertiary">
                  Create a route
                </Link>
              </>
            ) : (
              <Link to="/my-runs" className="home-action-secondary">
                My Runs
              </Link>
            )}
          </div>

          {/* Scenic carousel */}
          <div className="home-scenic-section">
            <div className="home-scenic-header">
              <div>
                <div className="home-scenic-label">Scenic nearby</div>
                <div className="home-scenic-location">Blacksburg, VA</div>
              </div>
              {scenic.length > 1 && (
                <div className="home-scenic-controls">
                  <button
                    onClick={() =>
                      setScenicIndex(
                        (prev) => (prev - 1 + scenic.length) % scenic.length
                      )
                    }
                    className="home-scenic-btn"
                    aria-label="Previous scenic spot"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setScenicIndex((prev) => (prev + 1) % scenic.length)
                    }
                    className="home-scenic-btn"
                    aria-label="Next scenic spot"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>

            {scenicError && (
              <div className="home-scenic-error">
                Couldn&apos;t load scenic spots right now.
              </div>
            )}

            {!scenicError && scenic.length === 0 && (
              <div className="home-scenic-loading">
                Searching for scenic spots...
              </div>
            )}

            {!scenicError && scenic.length > 0 && (
              <div className="home-scenic-carousel">
                <img
                  src={scenic[scenicIndex].photoUrl}
                  alt={scenic[scenicIndex].name}
                  className="home-scenic-image"
                />
                <div className="home-scenic-overlay" />
                <div className="home-scenic-info">
                  <div className="home-scenic-info-label">Scenic nearby</div>
                  <div className="home-scenic-info-name">
                    {scenic[scenicIndex].name}
                  </div>
                  {scenic[scenicIndex].vicinity && (
                    <div className="home-scenic-info-vicinity">
                      {scenic[scenicIndex].vicinity}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
