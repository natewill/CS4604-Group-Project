import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PaceSlider from "./PaceSlider";
import { formatPace } from "../utils/paceFormatters";

/*
  I want to show all the fields of the runner

  Edit Account: user is able to change fields
  There is cancel and save

  We have to check email and password if they are changed

*/
function ProfileDetails() {
  const { user, updateUserDetails, isLeader } = useAuth();
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

  /*
    I should make signup and this edit use the same input boxes
    because it has the same checks and stuff
  */
  return (
    <div>
      {!isEditing && (
        <button onClick={() => setIsEditing(!isEditing)}>Edit Profile</button>
      )}
      {isEditing && <button onClick={cancelEditing}>Cancel</button>}
      {isEditing && <button onClick={handleSave}>Save</button>}
      <div>
        <h2>First Name</h2>
        {isEditing ? (
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        ) : (
          <div>{firstName}</div>
        )}
      </div>
      <div>
        <h2>Middle Initial</h2>
        {isEditing ? (
          <input
            type="text"
            value={middleInitial}
            onChange={(e) => setMiddleInitial(e.target.value)}
          />
        ) : (
          <div>{middleInitial}</div>
        )}
      </div>
      <div>
        <h2>Last Name</h2>
        {isEditing ? (
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        ) : (
          <div>{lastName}</div>
        )}
      </div>
      <div>
        <h2>Email</h2>
        {isEditing ? (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        ) : (
          <div>{email}</div>
        )}
      </div>
      <div>
        <h2>Is Leader</h2>
        <div>{isLeader ? "Yes" : "No"}</div>
      </div>
      <div>
        <h2>Min Pace</h2>
        {isEditing ? (
          <PaceSlider
            label="Min Pace (min:sec per mile)"
            value={minPace || ""}
            onChange={setMinPace}
          />
        ) : (
          <div>{minPace ? formatPace(minPace) : "--:--"}</div>
        )}
      </div>
      <div>
        <h2>Max Pace</h2>
        {isEditing ? (
          <PaceSlider
            label="Max Pace (min:sec per mile)"
            value={maxPace || ""}
            onChange={setMaxPace}
          />
        ) : (
          <div>{maxPace ? formatPace(maxPace) : "--:--"}</div>
        )}
      </div>
      <div>
        <h2>Min Distance</h2>
        {isEditing ? (
          <input
            type="number"
            min="0"
            step="1"
            value={minDistance}
            onChange={(e) => setMinDistance(parseInt(e.target.value) || 0)}
          />
        ) : (
          <div>{minDistance}</div>
        )}
      </div>
      <div>
        <h2>Max Distance</h2>
        {isEditing ? (
          <input
            type="number"
            min="0"
            step="1"
            value={maxDistance}
            onChange={(e) => setMaxDistance(parseInt(e.target.value) || 0)}
          />
        ) : (
          <div>{maxDistance}</div>
        )}
      </div>
    </div>
  );
}

export default ProfileDetails;
