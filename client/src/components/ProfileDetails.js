import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PaceSlider from "./PaceSlider";
import { formatPace } from "../utils/paceFormatters";
import { useNavigate } from "react-router-dom";

const styles = {
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    padding: "1rem",
    overflowY: "auto", // Enable vertical scrolling
    overflowX: "hidden", // Prevent horizontal scrolling
  },
  buttonContainer: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  button: {
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    cursor: "pointer",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#f5f5f5",
  },
  logoutButton: {
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    cursor: "pointer",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#f5f5f5",
    marginLeft: "auto", // Pushes button to the right
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    padding: "1rem",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    backgroundColor: "#fafafa",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "#333",
  },
  row: {
    display: "flex",
    gap: "1.5rem",
    flexWrap: "wrap",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    flex: "1",
    minWidth: "200px",
  },
  fieldLabel: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#555",
    marginBottom: "0.25rem",
  },
  input: {
    padding: "0.5rem",
    fontSize: "1rem",
    fontFamily: "inherit",
    lineHeight: "1.5",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "100%",
    boxSizing: "border-box",
  },
  valueDisplay: {
    padding: "0.5rem",
    fontSize: "1rem",
    fontFamily: "inherit",
    lineHeight: "1.5",
    color: "#333",
    border: "1px solid #fff",
    borderRadius: "4px",
    width: "100%",
    boxSizing: "border-box",
  },
};
/*
  I want to show all the fields of the runner

  Edit Account: user is able to change fields
  There is cancel and save

  We have to check email and password if they are changed

*/
function ProfileDetails({ onNavigateToPassword }) {
  const navigate = useNavigate();
  const { user, updateUserDetails, isLeader, logout } = useAuth();

  const [firstName, setFirstName] = useState(user.first_name);
  const [middleInitial, setMiddleInitial] = useState(user.middle_initial);
  const [lastName, setLastName] = useState(user.last_name);
  const [email, setEmail] = useState(user.email);
  const [minPace, setMinPace] = useState(user.min_pace);
  const [maxPace, setMaxPace] = useState(user.max_pace);
  const [minDistance, setMinDistance] = useState(user.min_dist_pref);
  const [maxDistance, setMaxDistance] = useState(user.max_dist_pref);

  const [isEditing, setIsEditing] = useState(false);

  // set fields back to the value of the cookie
  const cancelEditing = () => {
    setFirstName(user.first_name);
    setMiddleInitial(user.middle_initial);
    setLastName(user.last_name);
    setEmail(user.email);
    // isLeader is not editable, so no need to reset it
    setMinPace(user.min_pace);
    setMaxPace(user.max_pace);
    setMinDistance(user.min_dist_pref);
    setMaxDistance(user.max_dist_pref);
    setIsEditing(false);
  };

  // Check if the user made any changes to their account when editing
  const getChangedFields = () => {
    const changes = {};
    if (firstName !== user.first_name) changes.first_name = firstName;
    if (middleInitial !== user.middle_initial)
      changes.middle_initial = middleInitial;
    if (lastName !== user.last_name) changes.last_name = lastName;
    if (email !== user.email) changes.email = email;
    // isLeader is not editable, so it's not included in changes
    if (minPace !== user.min_pace) changes.min_pace = minPace;
    if (maxPace !== user.max_pace) changes.max_pace = maxPace;
    if (minDistance !== user.min_dist_pref) changes.min_dist_pref = minDistance;
    if (maxDistance !== user.max_dist_pref) changes.max_dist_pref = maxDistance;
    return changes;
  };

  // Attempts to update runner's columns with whatever the user edited
  const handleSave = async () => {
    const changes = getChangedFields();
    if (Object.keys(changes).length === 0) {
      alert("No changes to save");
      setIsEditing(false);
      return;
    }

    try {
      // Make your API call here to update the user
      const response = await fetch("/api/edit-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(changes),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error);
      }

      // Update the user in AuthContext
      updateUserDetails(result.user);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error || "Failed to update profile. Please try again.");
    }
  };

  // Sets the main component in Profile.js to 'password' to load the
  // ChangePassword.js component
  const clickChangePassword = () => {
    if (onNavigateToPassword) {
      onNavigateToPassword();
    }
  };

  // Logout using AuthContext
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  /*
    I should make signup and this edit use the same input boxes
    because it has the same checks and stuff
  */
  return (
    <div style={styles.container}>
      {/* Action Buttons */}
      <div style={styles.buttonContainer}>
        {!isEditing && (
          <button style={styles.button} onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
        {isEditing && (
          <>
            <button style={styles.button} onClick={cancelEditing}>
              Cancel
            </button>
            <button style={styles.button} onClick={handleSave}>
              Save Changes
            </button>
          </>
        )}
        <button style={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Personal Information Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Personal Information</h2>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>First Name</label>
            {isEditing ? (
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={styles.input}
              />
            ) : (
              <div style={styles.valueDisplay}>{firstName}</div>
            )}
          </div>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Middle Initial</label>
            {isEditing ? (
              <input
                type="text"
                value={middleInitial}
                onChange={(e) => setMiddleInitial(e.target.value)}
                style={styles.input}
                maxLength={1}
              />
            ) : (
              <div style={styles.valueDisplay}>{middleInitial || "-"}</div>
            )}
          </div>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Last Name</label>
            {isEditing ? (
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={styles.input}
              />
            ) : (
              <div style={styles.valueDisplay}>{lastName}</div>
            )}
          </div>
        </div>
      </div>

      {/* Account Information Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Account Information</h2>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Email</label>
            {isEditing ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            ) : (
              <div style={styles.valueDisplay}>{email}</div>
            )}
          </div>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Password</label>
            <button style={styles.button} onClick={clickChangePassword}>
              Change Password
            </button>
          </div>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Leader Status</label>
            <div style={styles.valueDisplay}>{isLeader ? "Yes" : "No"}</div>
          </div>
        </div>
      </div>

      {/* Running Preferences Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Running Preferences</h2>
        <div style={styles.row}>
          <div style={{ ...styles.field, flex: "1 1 45%" }}>
            <label style={styles.fieldLabel}>Min Pace (per mile)</label>
            {isEditing ? (
              <PaceSlider
                label=""
                value={minPace || ""}
                onChange={setMinPace}
                defaultValue={240}
              />
            ) : (
              <div style={styles.valueDisplay}>
                {minPace ? formatPace(minPace) : "--:--"}
              </div>
            )}
          </div>
          <div style={{ ...styles.field, flex: "1 1 45%" }}>
            <label style={styles.fieldLabel}>Max Pace (per mile)</label>
            {isEditing ? (
              <PaceSlider
                label=""
                value={maxPace || ""}
                onChange={setMaxPace}
                defaultValue={900}
              />
            ) : (
              <div style={styles.valueDisplay}>
                {maxPace ? formatPace(maxPace) : "--:--"}
              </div>
            )}
          </div>
        </div>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Min Distance (miles)</label>
            {isEditing ? (
              <input
                type="number"
                min="0"
                step="1"
                value={minDistance}
                onChange={(e) => setMinDistance(parseInt(e.target.value) || 0)}
                style={styles.input}
              />
            ) : (
              <div style={styles.valueDisplay}>{minDistance || "-"}</div>
            )}
          </div>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Max Distance (miles)</label>
            {isEditing ? (
              <input
                type="number"
                min="0"
                step="1"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value) || 0)}
                style={styles.input}
              />
            ) : (
              <div style={styles.valueDisplay}>{maxDistance || "-"}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileDetails;
