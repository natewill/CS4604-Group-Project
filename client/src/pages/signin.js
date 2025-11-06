import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSignin(event) {
    event.preventDefault();
    setErr("");

    if (!email || !password) {
      return setErr("Email and password are required!");
    }

    try {
      // login() handles the API call and stores user in context
      // HTTP-only cookie is automatically set by server
      await login(email, password);

      // Redirect to summary page for testing
      navigate("/summary");
    } catch (error) {
      setErr(error.message || "Sign in failed!");
    }
  }

  return (
    <div>
      <h1>Sign in</h1>
      <form onSubmit={handleSignin} style={{ display: "grid", gap: 8 }}>
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="submit">Sign in</button>
      </form>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
    </div>
  );
}
