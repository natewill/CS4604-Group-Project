import React from "react";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user } = useAuth();

  return (
    <div>
      <h1>test home page</h1>
      <h2>Here is everything we store in the JWT</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}

export default Home;
