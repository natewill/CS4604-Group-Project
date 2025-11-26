import React, { useState, useEffect } from "react";

function ProfileAdmin() {
  const [runners, setRunners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchRunners();
  }, []);

  const fetchRunners = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/runners", {
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch runners");
      }

      const data = await response.json();
      setRunners(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const makeAdmin = async (runnerId) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(`/api/make-admin/${runnerId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update admin status");
      }

      console.log("Success response:", data);
      setSuccess(data.message);

      // Update the runner in the list
      setRunners(
        runners.map((runner) =>
          runner.runner_id === runnerId ? data.user : runner
        )
      );
    } catch (err) {
      console.error("Error making admin:", err);
      setError(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading runners...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Panel - Manage Users</h1>

      {error && (
        <div
          style={{
            color: "red",
            padding: "10px",
            marginBottom: "10px",
            backgroundColor: "#ffebee",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            color: "green",
            padding: "10px",
            marginBottom: "10px",
            backgroundColor: "#e8f5e9",
            borderRadius: "4px",
          }}
        >
          {success}
        </div>
      )}

      {runners.length === 0 ? (
        <p>No other runners found.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>Name</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Email</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Leader</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Admin</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {runners.map((runner) => (
              <tr
                key={runner.runner_id}
                style={{ borderBottom: "1px solid #eee" }}
              >
                <td style={{ padding: "10px" }}>{runner.full_name}</td>
                <td style={{ padding: "10px" }}>{runner.email}</td>
                <td style={{ padding: "10px" }}>
                  {runner.is_leader ? "Yes" : "No"}
                </td>
                <td style={{ padding: "10px" }}>
                  {runner.is_admin ? "Yes" : "No"}
                </td>
                <td style={{ padding: "10px" }}>
                  {!runner.is_admin ? (
                    <button onClick={() => makeAdmin(runner.runner_id)}>
                      Make Admin
                    </button>
                  ) : (
                    <span style={{ color: "#666", fontStyle: "italic" }}>
                      Admin (cannot revoke)
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProfileAdmin;
