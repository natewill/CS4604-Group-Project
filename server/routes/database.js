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

// Backend configuration: Maximum distance for location-based filtering (in miles)
const MAX_DISTANCE_MILES = 3;

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

// POST to insert a new route into database and link it to the logged-in user
router.post("/api/save-route", verifyToken, async (req, res) => {
  const runnerId = req.user?.runner_id;
  const { start_lat, start_lng, end_lat, end_lng, start_address, end_address, polyline, distance } = req.body;

  if (!runnerId) {
    return res.status(401).json({ error: "Unauthorized: must be logged in" });
  }

  // Validate required fields
  if (!start_lat || !start_lng || !end_lat || !end_lng || !polyline || !distance) {
    return res.status(400).json({ error: "Missing required route fields" });
  }

  // Insert route into routes table
  const insertRouteSql = `
    INSERT INTO routes (start_lat, start_lng, end_lat, end_lng, start_address, end_address, polyline, distance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertRouteSql,
    [start_lat, start_lng, end_lat, end_lng, start_address || null, end_address || null, polyline, distance],
    (err, result) => {
      if (err) {
        console.error("/api/save-route error:", err);
        return res.status(500).json({ error: "Failed to save route" });
      }

      const newRouteId = result.insertId;

      // Now link this route to the logged-in user in saved_routes
      const linkSql = `
        INSERT INTO saved_routes (runner_id, route_id)
        VALUES (?, ?)
      `;

      db.query(linkSql, [runnerId, newRouteId], (linkErr) => {
        if (linkErr) {
          console.error("Failed to link route to user:", linkErr);
          return res.status(500).json({ error: "Route saved, but failed to link to user" });
        }

        res.status(201).json({
          message: "Route saved and linked successfully",
          route_id: newRouteId,
        });
      });
    }
  );
});

// GET all runs with optional filtering
router.get("/api/runs", (req, res) => {
  const {
    paceMin,
    paceMax,
    dateFrom,
    dateTo,
    searchLeader,
    searchName,
    lat,
    lng,
  } = req.query;

  // Base SQL query
  let sql = `
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
      CONCAT(leader.first_name, ' ', leader.last_name) AS leader_name
    FROM runs r
    JOIN status s ON r.run_status_id = s.status_id
    JOIN routes rt ON r.run_route = rt.route_id
    JOIN runners leader ON r.leader_id = leader.runner_id
  `; //leader_name is just the first and last name together
  // join the runs table with the status table on the run_status_id
  // join the routes table on the run_route
  // join the runners table on the leader_id
 

  const conditions = [];
  const params = [];

  // Pace range filtering
  if (paceMin) {
    conditions.push("r.pace >= ?");
    params.push(parseInt(paceMin, 10));
  }
  if (paceMax) {
    conditions.push("r.pace <= ?");
    params.push(parseInt(paceMax, 10));
  }

  // Date range filtering
  if (dateFrom) {
    conditions.push("r.date >= ?");
    params.push(dateFrom);
  }
  if (dateTo) {
    conditions.push("r.date <= ?");
    params.push(dateTo);
  }

  // leader name search (LIKE for partial matching)
  if (searchLeader && searchLeader.trim()) {
    const searchTerm = `%${searchLeader.trim()}%`;
    conditions.push("(leader.first_name LIKE ? OR leader.last_name LIKE ?)");
    params.push(searchTerm, searchTerm);
  }

  //search by run name (LIKE does partial matching)
  if (searchName && searchName.trim()) {
    conditions.push("r.name LIKE ?");
    params.push(`%${searchName.trim()}%`);
  }

  // Distance filtering using Haversine formula
  if (lat && lng) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxDistanceKm = MAX_DISTANCE_MILES * 1.609344;

    // Haversine formula to calculate distance between two points on a sphere, 
    // idk if there is a better way to do this
    conditions.push(`( 
      6371 * acos(
        cos(radians(?)) * 
        cos(radians(rt.start_lat)) * 
        cos(radians(rt.start_lng) - radians(?)) + 
        sin(radians(?)) * 
        sin(radians(rt.start_lat))
      )
    ) <= ?`);
    params.push(userLat, userLng, userLat, maxDistanceKm);
  }

  // Add WHERE clause if conditions exist
  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  // Add ORDER BY
  sql += " ORDER BY r.date DESC, r.start_time DESC";

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch runs" });
    }

    res.json(results);
  });
});

// POST: create a new run (leaders only)
router.post("/api/run", verifyToken, (req, res) => {
  const runnerId = req.user?.runner_id;

  if (!runnerId) {
    return res.status(401).json({ error: "Unauthorized: must be logged in" });
  }

  // Check if user is a leader
  const checkLeaderSql = `
    SELECT is_leader FROM runners WHERE runner_id = ?
  `;
  db.query(checkLeaderSql, [runnerId], (leaderErr, leaderResults) => {
    if (leaderErr) {
      console.error("Error checking leader status:", leaderErr);
      return res.status(500).json({ error: "Failed to verify leader status" });
    }

    if (leaderResults.length === 0) {
      return res.status(404).json({ error: "Runner not found" });
    }

    if (!leaderResults[0].is_leader) {
      return res.status(403).json({ error: "Only leaders can create runs" });
    }

    // Extract all required fields from request body
    const {
      run_route,
      run_status_id,
      name,
      description,
      pace,
      date,
      start_time
    } = req.body;

    // Validate required fields
    if (
      !run_route ||
      !run_status_id ||
      !name ||
      pace === undefined ||
      !date ||
      !start_time
    ) {
      return res.status(400).json({ error: "Missing required run fields" });
    }

    const insertRunSql = `
      INSERT INTO runs
        (leader_id, run_route, run_status_id, name, description, pace, date, start_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertRunSql,
      [runnerId, run_route, run_status_id, name, description || null, pace, date, start_time],
      (err, result) => {
        if (err) {
          console.error("Error creating run:", err);
          return res.status(500).json({ error: "Failed to create run" });
        }

        res.status(201).json({
          message: "Run created successfully",
          run_id: result.insertId
        });
      }
    );
  });
});

// GET saved routes for the logged-in user
router.get("/api/routes", verifyToken, (req, res) => {
  const runnerId = req.user?.runner_id;

  if (!runnerId) {
    return res.status(401).json({ error: "Unauthorized: no valid user found" });
  }

  const sql = `
    SELECT 
      r.route_id,
      r.start_lat,
      r.start_lng,
      r.end_lat,
      r.end_lng,
      r.start_address,
      r.end_address,
      r.polyline,
      r.distance
    FROM saved_routes sr
    JOIN routes r ON sr.route_id = r.route_id
    WHERE sr.runner_id = ?
    ORDER BY r.route_id DESC;
  `;

  db.query(sql, [runnerId], (err, results) => {
    if (err) {
      console.error("Database query failed:", err);
      return res.status(500).json({ error: "Failed to fetch saved routes" });
    }

    res.json(results);
  });
});

// GET a specific route by ID
router.get("/api/routes/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      route_id,
      start_lat,
      start_lng,
      end_lat,
      end_lng,
      start_address,
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

// PUT update an existing run
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
  if (pace) {
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

// POST: save a route for the authenticated user
router.post("/api/routes/save/:routeId", verifyToken, (req, res) => {
  const runnerId = req.user?.runner_id;
  const { routeId } = req.params;

  if (!runnerId) {
    return res.status(401).json({ error: "Unauthorized: must be logged in" });
  }

  if (!routeId) {
    return res.status(400).json({ error: "Route ID is required" });
  }

  const sql = `
    INSERT IGNORE INTO saved_routes (runner_id, route_id)
    VALUES (?, ?)
  `;

  db.query(sql, [runnerId, routeId], (err, result) => {
    if (err) {
      console.error("Failed to save route:", err);
      return res.status(500).json({ error: "Failed to save route" });
    }

    res.status(201).json({ message: "Route saved successfully" });
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