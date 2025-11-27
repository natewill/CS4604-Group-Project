import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatPace } from "../utils/paceFormatters";

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

  const primaryColor = "#861F41";
  const accentColor = "#e8e8e8";

  return (
    <div
      style={{
        minHeight: "100%",
        background: "var(--bg-primary)",
        padding: "32px 24px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "min(960px, 100%)",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "18px",
          padding: "32px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: accentColor,
                  opacity: 0.7,
                  marginBottom: "6px",
                }}
              >
                Dashboard
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "32px",
                  fontWeight: 700,
                  color: accentColor,
                }}
              >
                Welcome, {user?.first_name || "Runner"}
              </h1>
              <p
                style={{
                  margin: "8px 0 0",
                  color: "var(--text-secondary)",
                  fontSize: "16px",
                }}
              >
                {formatPaceRange(user?.min_pace, user?.max_pace)}
              </p>
            </div>
            <div
              style={{
                alignSelf: "flex-start",
                padding: "10px 14px",
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
                borderRadius: "10px",
                border: "1px solid var(--border-color)",
                fontSize: "13px",
              }}
            >
              {user?.min_dist_pref && user?.max_dist_pref
                ? `${user.min_dist_pref}-${user.max_dist_pref} mi preference`
                : "Set your distance preferences"}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
              marginTop: "8px",
            }}
          >
            <Link
              to="/runfinder"
              style={{
                textDecoration: "none",
                background: "#000",
                color: "#fff",
                padding: "14px 16px",
                borderRadius: "12px",
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              Find a run
            </Link>

            {isLeader && (
              <>
                <Link
                  to="/runs/new"
                  style={{
                    textDecoration: "none",
                    background: primaryColor,
                    color: "#fff",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  Plan a new run
                </Link>

                <Link
                  to="/create-route"
                  style={{
                    textDecoration: "none",
                    background: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    textAlign: "center",
                    fontWeight: 600,
                    border: "1px solid var(--border-color)",
                  }}
                >
                  Create a route
                </Link>
              </>
            )}
          </div>

          {/* Scenic carousel */}
          <div style={{ marginTop: "32px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: accentColor,
                    opacity: 0.6,
                  }}
                >
                  Scenic nearby
                </div>
                <div style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
                  Blacksburg, VA
                </div>
              </div>
              {scenic.length > 1 && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() =>
                      setScenicIndex(
                        (prev) => (prev - 1 + scenic.length) % scenic.length
                      )
                    }
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                    }}
                    aria-label="Previous scenic spot"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setScenicIndex((prev) => (prev + 1) % scenic.length)
                    }
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                    }}
                    aria-label="Next scenic spot"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>

            {scenicError && (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "1px dashed var(--border-color)",
                  color: "var(--text-secondary)",
                }}
              >
                Couldn&apos;t load scenic spots right now.
              </div>
            )}

            {!scenicError && scenic.length === 0 && (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "1px dashed var(--border-color)",
                  color: "var(--text-secondary)",
                }}
              >
                Searching for scenic spots...
              </div>
            )}

            {!scenicError && scenic.length > 0 && (
              <div
                style={{
                  position: "relative",
                  height: "300px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 12px 28px rgba(0,0,0,0.08)",
                  backgroundColor: "#111",
                }}
              >
                <img
                  src={scenic[scenicIndex].photoUrl}
                  alt={scenic[scenicIndex].name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.65) 100%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 16,
                    bottom: 16,
                    color: "#fff",
                  }}
                >
                  <div style={{ fontSize: "13px", opacity: 0.8 }}>
                    Scenic nearby
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 700 }}>
                    {scenic[scenicIndex].name}
                  </div>
                  {scenic[scenicIndex].vicinity && (
                    <div style={{ fontSize: "14px", opacity: 0.9 }}>
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
