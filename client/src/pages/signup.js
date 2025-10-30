// Signup.js
import { useState } from "react";

export default function Signup() {
  const [step, setStep] = useState(1); //two steps, first check if email and password are valid, 
  //then submit all information
  const [err, setErr] = useState(""); 

  // step1 state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // step2 state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [middleInitial, setMI]    = useState("");
  const [isLeader, setIsLeader]   = useState(false);
  const [minPace, setMinPace]     = useState("");
  const [maxPace, setMaxPace]     = useState("");
  const [minDist, setMinDist]     = useState("");
  const [maxDist, setMaxDist]     = useState("");

  async function checkEmailAndPw(event) {
    event.preventDefault();
    setErr("");

    try {
      // local validation
      const normEmail = email.trim().toLowerCase();
      if (!normEmail || !password) {
        return setErr("Email and Password are required!");
      }

      // server availability check
      const r = await fetch("/signup/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normEmail }),
      });

      if (r.status === 409) {
        return setErr("Email lready exists!");
      }
      if (!r.ok) {
        return setErr("Server Error");
      }

      //email and password are valid, move to step 2
      setStep(2);
    } catch (error) {
      console.error("Signup check error:", error);
      setErr("Network error. Please try again.");
    }
  }

  async function submitAll(event) {
    event.preventDefault();
    setErr("");

    const payload = {
      email: email.trim().toLowerCase(),
      password,
      first_name: firstName || null,
      last_name: lastName || null,
      middle_initial: middleInitial || null,
      is_leader: isLeader,
      min_pace: minPace ? Number(minPace) : null,
      max_pace: maxPace ? Number(maxPace) : null,
      min_dist_pref: minDist ? Number(minDist) : null,
      max_dist_pref: maxDist ? Number(maxDist) : null,
    };

    const response = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.status === 409) {
      // race: someone registered this email in between step1 and step2
      return setErr("Email already exists!");
    }
    if (!response.ok) {
      return setErr(data.error || "signup failed");
    }

    alert(`created account #${data.runner_id} for ${data.email}`);
  }

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 360 }}>
      <h2>Sign up</h2>
      {step === 1 && (
        <form onSubmit={checkEmailAndPw} style={{ display: "grid", gap: 8 }}>
          <input
            placeholder="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
          />
          <input
            placeholder="password"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
          />
          <button type="submit">Continue</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={submitAll} style={{ display: "grid", gap: 8 }}>
          <input placeholder="first name" value={firstName} onChange={e=>setFirstName(e.target.value)} />
          <input placeholder="last name" value={lastName} onChange={e=>setLastName(e.target.value)} />
          <input placeholder="middle initial" value={middleInitial} onChange={e=>setMI(e.target.value)} />
          <label>
            <input type="checkbox" checked={isLeader} onChange={e=>setIsLeader(e.target.checked)} />
            Leader?
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <input placeholder="min pace" value={minPace} onChange={e=>setMinPace(e.target.value)} />
            <input placeholder="max pace" value={maxPace} onChange={e=>setMaxPace(e.target.value)} />
            <input placeholder="min dist" value={minDist} onChange={e=>setMinDist(e.target.value)} />
            <input placeholder="max dist" value={maxDist} onChange={e=>setMaxDist(e.target.value)} />
          </div>
          <button type="submit">Create account</button>
          <button type="button" onClick={() => setStep(1)}>Back</button>
        </form>
      )}

      {err && <div style={{ color: "crimson" }}>{err}</div>}
    </div>
  );
}