import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ProfileDetails from "../components/ProfileDetails";
import ProfileStatisitcs from "../components/ProfileStatistics";
import ChangePassword from "../components/ChangePassword";
import "../styles/Profile.css";

/*
  I want this to be the profile page
  should show all your profile details (should be able to edit and update)

  show all profile stats (is leader, runs, runs hosted, runs joined, 
  miles ran, avg pace, longest run, fastest pace, most recent run)

  View saved routes
  View upcoming runs

  should be able to logout here
  delete account here

*/
function Profile() {
  const { user } = useAuth();
  const [activeMainComponent, setActiveMainComponent] = useState("details");
  const [hoveredItem, setHoveredItem] = useState(null); // Track which item is hovered

  // useEffect that runs when activeMainComponent changes
  useEffect(() => {
    // This will run whenever activeMainComponent updates
    // ultimately rerendering the page with the correct component
  }, [activeMainComponent]); // Dependency array - runs when activeMainComponent changes

  const renderMainComponent = () => {
    switch (activeMainComponent) {
      case "details":
        return (
          <ProfileDetails
            onNavigateToPassword={() => setActiveMainComponent("password")}
          />
        );
      case "statistics":
        return <ProfileStatisitcs />;
      case "password":
        return (
          <ChangePassword
            onNavigateBack={() => setActiveMainComponent("details")}
          />
        );
      default:
        return;
    }
  };

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <div className="profile-sidebar">
        <div
          className={
            activeMainComponent === "details" || hoveredItem === "details"
              ? "profile-sidebar-elem-active"
              : "profile-sidebar-elem"
          }
          onClick={() => setActiveMainComponent("details")}
          onMouseEnter={() => setHoveredItem("details")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <h2>Account Details</h2>
        </div>

        <div
          className={
            activeMainComponent === "statistics" || hoveredItem === "statistics"
              ? "profile-sidebar-elem-active"
              : "profile-sidebar-elem"
          }
          onClick={() => setActiveMainComponent("statistics")}
          onMouseEnter={() => setHoveredItem("statistics")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <h2>Statistics</h2>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="profile-main">{renderMainComponent()}</div>
    </div>
  );
}

export default Profile;
