const express = require("express");
const router = express.Router();
const db = require("./connection");
const { signup, signin, getPwAndIdFromEmail } = require("./accounts");
const axios = require("axios");

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

router.post("/signup", async (req, res) => {
  try {
    // req.body comes from your React signup form
    const {
      first_name,
      last_name,
      middle_initial,
      email,
      is_leader,
      min_pace,
      max_pace,
      min_dist_pref,
      max_dist_pref,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    const normEmail = String(email).trim().toLowerCase();
    const minPaceNum =
      min_pace !== undefined && min_pace !== null && min_pace !== ""
        ? Number(min_pace)
        : null;
    const maxPaceNum =
      max_pace !== undefined && max_pace !== null && max_pace !== ""
        ? Number(max_pace)
        : null;
    const minDistNum =
      min_dist_pref !== undefined &&
      min_dist_pref !== null &&
      min_dist_pref !== ""
        ? Number(min_dist_pref)
        : null;
    const maxDistNum =
      max_dist_pref !== undefined &&
      max_dist_pref !== null &&
      max_dist_pref !== ""
        ? Number(max_dist_pref)
        : null;

    if (minPaceNum !== null && maxPaceNum !== null && minPaceNum > maxPaceNum) {
      return res
        .status(400)
        .json({ error: "min_pace cannot be greater than max_pace" });
    }
    if (minDistNum !== null && maxDistNum !== null && minDistNum > maxDistNum) {
      return res
        .status(400)
        .json({ error: "min_dist_pref cannot be greater than max_dist_pref" });
    }

    // build runner_data dict
    const runner_data = {
      first_name,
      last_name,
      middle_initial,
      email: normEmail,
      user_password: null, // gets filled in signup()
      is_leader: !!is_leader,
      min_pace: minPaceNum,
      max_pace: maxPaceNum,
      min_dist_pref: minDistNum,
      max_dist_pref: maxDistNum,
    };

    const result = await signup(runner_data, password);

    if (result === -1) {
      return res.status(409).json({ error: "email already exists" });
    }

    return res.status(201).json({ runner_id: result, email });
  } catch (err) {
    console.error("signup error:", err);
    res.status(500).json({ error: "server error" });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }
  const result = await signin(email, password);
  if (result === -1) {
    return res.status(401).json({ error: "email not found" });
  }
  if (result === -2) {
    return res.status(401).json({ error: "incorrect password" });
  }
  return res.json(result);
});

// Google Maps API server routes

// Geocode (Convert address to coordinates)
router.get("/api/geocode", async (req, res) => {
  try {
    const address = req.query.address;

    if (!address) return res.status(400).json({ error: "Missing address" });

    const url = `https://maps.googleapis.com/maps/api/geocode/json`;
    const { data } = await axios.get(url, {
      params: { address, key: process.env.GOOGLE_MAPS_API_KEY },
    });

    res.json(data);
  } catch (err) {
    console.error("/api/geocode error", err.response?.data || err.message);
    res.status(500).json({ error: "Geocode failed" });
  }
});

// Reverse Geocode (convert coordinates to address)
// Google maps address validation API
// Address Validation API expects this json
// where addressLines is ["street address", "city, State, zip code"]
router.get("/api/reverse-geocode", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Missing lat or lng" });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json`;
    const { data } = await axios.get(url, {
      params: {
        latlng: `${lat},${lng}`,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    res.json(data);
  } catch (err) {
    console.error(
      "/api/reverse-geocode error",
      err.response?.data || err.message
    );
    res.status(500).json({ error: "Reverse geocode failed" });
  }
});


// Post to insert a new Route into database
router.post("/api/save-route", async (req, res) => {
  const { start_lat, start_lng, end_lat, end_lng, start_address, end_address, polyline, distance } =
    req.body;

  db.query(
    `INSERT INTO routes (start_lat, start_lng, end_lat, end_lng, start_address, end_address, polyline, distance)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [start_lat, start_lng, end_lat, end_lng, start_address, end_address, polyline, distance],
    (err, results) => {
      if (err) {
        console.error("/api/save-route error", err);
        return res.status(500).json({ error: "Failed to save route." });
      }

      console.log("Inserted route ID:", results.insertId);
      res.status(201).json({
        message: "Route saved successfully",
        route_id: results.insertId, // ✅ this ensures the frontend gets the route ID
      });
    }
  );
});


// GET all runs
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
      DATE_FORMAT(r.date, '%M %d, %Y') AS date,
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

// POST create a new run
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
  if (!leader_id || !run_route || !run_status_id || !name || !pace || !date || !start_time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO runs (leader_id, run_route, run_status_id, name, description, pace, date, start_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [leader_id, run_route, run_status_id, name, description || null, pace, date, start_time],
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

// GET all routes (start/end coordinates included directly in table)
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


// GET a specific route by ID
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
      updated_fields: updates.map(u => u.split(" = ")[0]),
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
