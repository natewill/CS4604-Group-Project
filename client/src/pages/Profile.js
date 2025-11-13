import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ProfileDetails from "../components/ProfileDetails";
import ProfileStatisitcs from "../components/ProfileStatistics";
import ChangePassword from "../components/ChangePassword";

const styles = {
  container: {
    width: "100%",
    height: "100%",
    display: "flex", // This makes it a flex container
  },
  sidebar: {
    width: "20%", // Fixed width for sidebar
    borderRight: "5px solid black",
    display: "flex",
    flexDirection: "column",
  },
  sidebar_elem: {
    borderBottom: "2px solid black",
    cursor: "pointer",
  },
  sidebar_elem_active: {
    borderBottom: "2px solid black",
    cursor: "pointer",
    backgroundColor: "#bbb", // Highlight active item
    transition: "background-color 0.2s",
  },
  main: {
    width: "80%",
    flex: 1, // Takes remaining space
    padding: "1rem",
    overflow: "hidden", // Prevent main from scrolling
    display: "flex",
    flexDirection: "column",
  },
};

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
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div
          style={
            activeMainComponent === "details"
              ? styles.sidebar_elem_active
              : hoveredItem === "details"
              ? styles.sidebar_elem_active
              : styles.sidebar_elem
          }
          onClick={() => setActiveMainComponent("details")}
          onMouseEnter={() => setHoveredItem("details")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <h2>Account Details</h2>
        </div>

        <div
          style={
            activeMainComponent === "statistics"
              ? styles.sidebar_elem_active
              : hoveredItem === "statistics"
              ? styles.sidebar_elem_active
              : styles.sidebar_elem
          }
          onClick={() => setActiveMainComponent("statistics")}
          onMouseEnter={() => setHoveredItem("statistics")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <h2>Statistics</h2>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.main}>{renderMainComponent()}</div>
    </div>
  );
}

export default Profile;
