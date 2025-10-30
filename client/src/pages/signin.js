import { useState } from "react";


export default function Signin() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");

    async function signin(event) {
        event.preventDefault();
        setErr("");

        const payload = { email, password };

        if (!email || !password) {
            return setErr("Email and password are required!");
        }

        const response = await fetch("/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (response.status === 401) {
            return setErr(data.error);
        }
        if (!response.ok) {
            return setErr("signin failed!");
        }

        console.log(data);
        alert(`signed in as runner with id ${data}`);
    }

  return (
    <div>
      <h1>Sign in</h1>
      <form onSubmit={signin} style={{ display: "grid", gap: 8 }}>
        <input placeholder="email" value={email} onChange={event=>setEmail(event.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={event=>setPassword(event.target.value)} />
        <button type="submit">Sign in</button>
      </form>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
    </div>
  );
}