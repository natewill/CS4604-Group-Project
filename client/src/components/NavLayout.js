import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  const isLeader = user && (user.is_leader === 1 || user.is_leader === true);
  return (
    <div>
      <nav
        style={{
          display: "flex",
          gap: "1rem",
          padding: "1rem",
          backgroundColor: "#eee",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link to="/home">Home</Link>
          <Link to="/runfinder">Find Runs</Link>
          <Link to="/my-runs">My Runs</Link>
          {/* Only show New Run if the user is a leader */}
          {isLeader && <Link to="/runs/new">New Run</Link>}
          <Link to="/create-route">Create Route</Link>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {user && (
            <span>
              Welcome, {user.first_name} {user.last_name}
            </span>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <Outlet /> {/* This renders the child routes */}
    </div>
  );
}

export default Layout;
