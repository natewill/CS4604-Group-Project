const express = require("express");
const router = express.Router();
const db = require("../connection");
const { signup, login, getPwAndIdFromEmail } = require("../accounts");
const { generateJWT, verifyToken } = require("../auth");
const {
  normalizeString,
  normalizeInteger,
  validateSignupData,
} = require("../utils/validation");

// GET all runners
router.get("/api/runners", (req, res) => {
  db.query("SELECT * FROM runners", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

// get summary
router.get("/api/summary", (req, res) => {
  db.query("SELECT DATABASE() AS name", (err, dbResult) => {
    if (err) return res.status(500).json({ error: "Failed (name)" });

    const dbName = dbResult[0].name;
    db.query("SELECT COUNT(*) AS count FROM runners", (err, r1) => {
      if (err) return res.status(500).json({ error: "Failed (runners)" });
      db.query("SELECT COUNT(*) AS count FROM runs", (err, r2) => {
        if (err) return res.status(500).json({ error: "Failed (runs)" });

        res.json({
          dbName,
          runnersCount: r1[0].count,
          runsCount: r2[0].count,
        });
      });
    });
  });
});

// Post to check whether the email and password are available for signup
router.post("/signup/check", async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  if (!email) return res.status(400).json({ error: "email required" });

  if (await getPwAndIdFromEmail(email)) {
    return res.status(409).json({ error: "email_exists" });
  }

  return res.json({ available: true });
});

// Post to insert new user into the database
router.post("/signup", async (req, res) => {
  try {
    const {
      first_name: raw_first_name,
      last_name: raw_last_name,
      middle_initial: raw_middle_initial,
      email: raw_email,
      is_leader: raw_is_leader,
      min_pace: raw_min_pace,
      max_pace: raw_max_pace,
      min_dist_pref: raw_min_dist_pref,
      max_dist_pref: raw_max_dist_pref,
      password,
    } = req.body;

    // Validate all input data
    const validationErrors = validateSignupData({
      email: raw_email,
      password,
      first_name: raw_first_name,
      last_name: raw_last_name,
      middle_initial: raw_middle_initial,
      is_leader: raw_is_leader,
      min_pace: raw_min_pace,
      max_pace: raw_max_pace,
      min_dist_pref: raw_min_dist_pref,
      max_dist_pref: raw_max_dist_pref,
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors,
      });
    }

    // Normalize and convert types after validation passes
    // Required fields are guaranteed to be present by validation
    const runner_data = {
      first_name: String(raw_first_name).trim(),
      last_name: String(raw_last_name).trim(),
      middle_initial: String(raw_middle_initial).trim().charAt(0).toUpperCase(),
      email: String(raw_email).trim().toLowerCase(),
      user_password: null, // gets filled in signup()
      is_leader: !!raw_is_leader,
      min_pace: normalizeInteger(raw_min_pace),
      max_pace: normalizeInteger(raw_max_pace),
      min_dist_pref: normalizeInteger(raw_min_dist_pref),
      max_dist_pref: normalizeInteger(raw_max_dist_pref),
    };

    // Create user account
    const runner_id = await signup(runner_data, password);

    if (runner_id === -1) {
      return res.status(409).json({ error: "email already exists" });
    }

    // Fetch full user details and set authentication cookie
    db.query(
      "SELECT runner_id, first_name, last_name, middle_initial, email, is_leader, min_pace, max_pace, min_dist_pref, max_dist_pref FROM runners WHERE runner_id = ?",
      [runner_id],
      (err, results) => {
        if (err) {
          console.error("Database error fetching user:", err);
          return res.status(500).json({ error: "Server error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        // grab runner object and generate JWT token
        const runner = results[0];
        const token = generateJWT(runner);

        // Set HTTP-only cookie with JWT token
        // Set HTTP-only cookie with the token
        // secure = false for local dev (cookies are send over http connection)
        // sameSite = strict for CSRF protection
        // CMIYC = Cache Me If You Can
        res.cookie("CMIYC", token, {
          httpOnly: true,
          secure: false, // Set to true in production with HTTPS
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(201).json({ user: runner });
      }
    );
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// We send request with body {email:{email}, password:{password}}
// we return cookie with JWT token and req.user={runner db object}
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }

  const result = await login(email, password);
  if (result === -1) {
    return res.status(401).json({ error: "email not found" });
  }
  if (result === -2) {
    return res.status(401).json({ error: "incorrect password" });
  }

  // result is the runner_id, now fetch full user details
  try {
    db.query(
      "SELECT runner_id, first_name, last_name, middle_initial, email, is_leader, min_pace, max_pace, min_dist_pref, max_dist_pref FROM runners WHERE runner_id = ?",
      [result],
      (err, results) => {
        if (err) {
          console.error("Database error fetching user:", err);
          return res.status(500).json({ error: "Server error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        const runner = results[0];

        // Generate JWT token with full runner object (excluding password)
        const token = generateJWT(runner);

        // Set HTTP-only cookie with the token
        // secure = false for local dev (cookies are send over http connection)
        // sameSite = lax for local dev (allows for backend and frontend)
        // CMIYC = Cache Me If You Can
        res.cookie("CMIYC", token, {
          httpOnly: true, // Cookie not accessible via JavaScript (more secure)
          secure: false,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        });

        // Return user object (token is in cookie, not in response)
        // But isnt runner object already in the token?
        return res.json({
          user: runner,
        });
      }
    );
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET current user info (requires authentication)
router.get("/api/me", verifyToken, (req, res) => {
  // returns user runner object from the db using the JWT token
  res.json(req.user);
});

// POST logout - clears the HTTP-only cookie
router.post("/api/logout", (req, res) => {
  res.clearCookie("CMIYC", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });
  res.json({ message: "Logged out successfully" });
});

// Post to insert a new Route into database - ENHANCED with address fields
router.post("/api/save-route", async (req, res) => {
  const { start_lat, start_lng, end_lat, end_lng, start_address, end_address, polyline, distance } =
    req.body;

  db.query(
    `INSERT INTO routes (start_lat, start_lng, end_lat, end_lng, start_address, end_address, polyline, distance)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [start_lat, start_lng, end_lat, end_lng, start_address || null, end_address || null, polyline, distance],
    (err, results) => {
      if (err) {
        console.error("/api/save-route error", err);
        return res.status(500).json({ error: "Failed to save route." });
      }

      res.status(201).json({
        message: "Route saved successfully",
        route_id: results.insertId, // ✅ this ensures the frontend gets the route ID
      });
    }
  );
});

// GET all runs - ENHANCED VERSION with address fields and leader info
router.get("/api/runs", (req, res) => {
  const sql = `
    SELECT 
      r.run_id,
      r.leader_id,
      r.run_route,
      r.run_status_id,
      s.status_description AS status,
      r.name,
      r.description,
      r.pace,
      DATE_FORMAT(r.date, '%Y-%m-%d') AS date,
      TIME_FORMAT(r.start_time, '%l:%i %p') AS start_time,
      rt.start_lat,
      rt.start_lng,
      rt.end_lat,
      rt.end_lng,
      rt.start_address,
      rt.end_address,
      rt.polyline,
      rt.distance,
      CONCAT(COALESCE(leader.first_name, ''), ' ', COALESCE(leader.last_name, '')) AS leader_name,
      leader.first_name AS leader_first_name,
      leader.last_name AS leader_last_name
    FROM runs r
    JOIN status s ON r.run_status_id = s.status_id
    JOIN routes rt ON r.run_route = rt.route_id
    JOIN runners leader ON r.leader_id = leader.runner_id
    ORDER BY r.date DESC, r.start_time DESC;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database query failed:", err);
      return res.status(500).json({ error: "Failed to fetch runs" });
    }

    res.json(results);
  });
});

// POST create a new run - ENHANCED with pace validation as INT seconds
router.post("/api/runs", (req, res) => {
  const {
    leader_id,
    run_route,
    run_status_id,
    name,
    description,
    pace,
    date,
    start_time,
  } = req.body;

  // Validate required fields
  if (
    !leader_id ||
    !run_route ||
    !run_status_id ||
    !name ||
    !pace ||
    !date ||
    !start_time
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate pace is a number (seconds)
  const paceSeconds = typeof pace === 'number' ? pace : parseInt(pace, 10);
  if (isNaN(paceSeconds) || paceSeconds < 0) {
    return res.status(400).json({ error: "Pace must be a positive number (seconds)" });
  }

  const sql = `
    INSERT INTO runs (leader_id, run_route, run_status_id, name, description, pace, date, start_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      leader_id,
      run_route,
      run_status_id,
      name,
      description || null,
      paceSeconds,
      date,
      start_time,
    ],
    (err, result) => {
      if (err) {
        console.error("Database insert failed:", err);
        return res.status(500).json({ error: "Failed to create new run" });
      }

      // Respond with the newly created run ID
      res.status(201).json({
        message: "Run created successfully",
        run_id: result.insertId,
      });
    }
  );
});

// GET all routes (start/end coordinates included directly in table) - ENHANCED with address fields
router.get("/api/routes", (req, res) => {
  const sql = `
    SELECT 
      route_id,
      start_lat,
      start_lng,
      start_address,
      end_lat,
      end_lng,
      end_address,
      polyline,
      distance
    FROM routes
    ORDER BY route_id;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database query failed:", err);
      return res.status(500).json({ error: "Failed to fetch routes" });
    }

    res.json(results);
  });
});

// GET a specific route by ID - ENHANCED with address fields
router.get("/api/routes/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      route_id,
      start_lat,
      start_lng,
      start_address,
      end_lat,
      end_lng,
      end_address,
      polyline,
      distance
    FROM routes
    WHERE route_id = ?;
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Database query failed:", err);
      return res.status(500).json({ error: "Failed to fetch route" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Route not found" });
    }

    res.json(results[0]);
  });
});

// PUT update an existing run - ENHANCED with pace validation as INT seconds
// Can be used like PUT or PATCH where we replace the whole record or
// only update one or more fields that are included in the request params
router.put("/api/runs/:id", (req, res) => {
  const { id } = req.params;
  const {
    leader_id,
    run_route,
    run_status_id,
    name,
    description,
    pace,
    date,
    start_time,
  } = req.body;

  // Check if at least one field is provided
  if (
    !leader_id &&
    !run_route &&
    !run_status_id &&
    !name &&
    !description &&
    !pace &&
    !date &&
    !start_time
  ) {
    return res.status(400).json({ error: "No fields provided to update" });
  }

  // Build dynamic query based on provided fields
  const updates = [];
  const values = [];

  if (leader_id) {
    updates.push("leader_id = ?");
    values.push(leader_id);
  }
  if (run_route) {
    updates.push("run_route = ?");
    values.push(run_route);
  }
  if (run_status_id) {
    updates.push("run_status_id = ?");
    values.push(run_status_id);
  }
  if (name) {
    updates.push("name = ?");
    values.push(name);
  }
  if (description !== undefined) {
    updates.push("description = ?");
    values.push(description);
  }
  if (pace !== undefined) {
    if (typeof pace !== 'number') {
      return res.status(400).json({ error: "Pace must be a number (seconds)" });
    }
    if (isNaN(pace) || pace < 0) {
      return res.status(400).json({ error: "Pace must be a positive number (seconds)" });
    }
    updates.push("pace = ?");
    values.push(pace);
  }
  if (date) {
    updates.push("date = ?");
    values.push(date);
  }
  if (start_time) {
    updates.push("start_time = ?");
    values.push(start_time);
  }

  values.push(id);

  const sql = `
    UPDATE runs
    SET ${updates.join(", ")}
    WHERE run_id = ?
  `;

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database update failed:", err);
      return res.status(500).json({ error: "Failed to update run" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Run not found" });
    }

    res.json({
      message: "Run updated successfully",
      run_id: id,
      updated_fields: updates.map((u) => u.split(" = ")[0]),
    });
  });
});

// GET all leaders
router.get("/api/leaders", (req, res) => {
  const sql = `
    SELECT 
      runner_id, 
      CONCAT(first_name, ' ', COALESCE(middle_initial, ''), ' ', last_name) AS full_name,
      email
    FROM runners
    WHERE is_leader = TRUE
    ORDER BY last_name, first_name;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database query failed:", err);
      return res.status(500).json({ error: "Failed to fetch leaders" });
    }

    res.json(results);
  });
});

// GET a static map url of a route
router.get("/api/static-map", (req, res) => {
  const { polyline, start_lat, start_lng, end_lat, end_lng } = req.query;

  //if any of the required parameters are missing, return an error
  if (!polyline || !start_lat || !start_lng || !end_lat || !end_lng) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  
  try {
    //returns a url that can be used to display a static map of the route
    const url = `https://maps.googleapis.com/maps/api/staticmap?size=600x400&path=color:0x0000ff|weight:10|enc:${polyline}&markers=color:green|label:S|${start_lat},${start_lng}&markers=color:red|label:E|${end_lat},${end_lng}&visible=${start_lat},${start_lng}&visible=${end_lat},${end_lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    res.json({ url });
  } catch (err) {
    console.error("Error generating static map:", err);
    return res.status(500).json({ error: "Failed to generate static map" });
  }
});

// DELETE a specific run
router.delete("/api/runs/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM runs WHERE run_id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting run:", err);
      return res.status(500).json({ error: "Failed to delete run" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Run not found" });
    }

    res.json({ message: "Run deleted successfully" });
  });
});

module.exports = router;

