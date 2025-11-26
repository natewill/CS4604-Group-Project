const express = require("express");
const router = express.Router();
const db = require("../connection");
const {
  signup,
  login,
  getPwAndIdFromEmail,
  hashPassword,
  verifyPassword,
} = require("../accounts");
const { generateJWT, verifyToken } = require("../auth");
const {
  normalizeString,
  normalizeInteger,
  validateSignupData,
  validateRequiredString,
} = require("../utils/validation");

// Backend configuration: Maximum distance for location-based filtering (in miles)
const MAX_DISTANCE_MILES = 3;
const PASSWORD_MIN_LENGTH = 6;

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
      "SELECT runner_id, first_name, last_name, middle_initial, email, is_leader, is_admin, min_pace, max_pace, min_dist_pref, max_dist_pref FROM runners WHERE runner_id = ?",
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

// PUT: update user profile (requires authentication)
// We do same validation as signup so maybe we can combine these?
router.put("/api/edit-profile", verifyToken, async (req, res) => {
  const runnerId = req.user?.runner_id;

  if (!runnerId) {
    return res.status(401).json({ error: "Unauthorized: must be logged in" });
  }

  // determine which fields are sent
  const hasFirstName = "first_name" in req.body;
  const hasMiddleInitial = "middle_initial" in req.body;
  const hasLastName = "last_name" in req.body;
  const hasEmail = "email" in req.body;
  const hasMinPace = "min_pace" in req.body;
  const hasMaxPace = "max_pace" in req.body;
  const hasMinDistPref = "min_dist_pref" in req.body;
  const hasMaxDistPref = "max_dist_pref" in req.body;

  // Build dynamic query based on provided fields
  const updates = [];
  const values = [];

  // Validate the fields if they are in the request
  // Handle email validation first if email is being updated
  if (hasEmail) {
    const email = normalizeString(req.body.email, 100);
    if (email === null || email.length === 0) {
      return res.status(400).json({ error: "email cannot be empty" });
    }
    const normalizedEmail = email.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res
        .status(400)
        .json({ error: "email must be a valid email address" });
    }

    // Check if email is already taken by another user (must be done before building update query)
    try {
      const emailCheck = await new Promise((resolve, reject) => {
        db.query(
          "SELECT runner_id FROM runners WHERE email = ? AND runner_id != ?",
          [normalizedEmail, runnerId],
          (emailErr, emailResults) => {
            if (emailErr) {
              reject(emailErr);
            } else {
              resolve(emailResults);
            }
          }
        );
      });

      if (emailCheck.length > 0) {
        return res.status(409).json({ error: "email already exists" });
      }

      // Email is available, add to updates
      updates.push("email = ?");
      values.push(normalizedEmail);
    } catch (emailErr) {
      console.error("Database error checking email:", emailErr);
      return res.status(500).json({ error: "Failed to validate email" });
    }
  }

  if (hasFirstName) {
    const first_name = normalizeString(req.body.first_name, 100);
    if (first_name === null || first_name.length === 0) {
      return res.status(400).json({ error: "first_name cannot be empty" });
    }
    updates.push("first_name = ?");
    values.push(first_name);
  }

  if (hasMiddleInitial) {
    const middle_initial = String(req.body.middle_initial)
      .trim()
      .charAt(0)
      .toUpperCase();
    if (middle_initial.length === 0) {
      return res.status(400).json({ error: "middle_initial cannot be empty" });
    }
    if (middle_initial.length > 1) {
      return res
        .status(400)
        .json({ error: "middle_initial must be a single character" });
    }
    if (!/^[a-zA-Z]$/.test(middle_initial)) {
      return res.status(400).json({ error: "middle_initial must be a letter" });
    }
    updates.push("middle_initial = ?");
    values.push(middle_initial);
  }

  if (hasLastName) {
    const last_name = normalizeString(req.body.last_name, 100);
    if (last_name === null || last_name.length === 0) {
      return res.status(400).json({ error: "last_name cannot be empty" });
    }
    updates.push("last_name = ?");
    values.push(last_name);
  }

  if (hasMinPace) {
    const min_pace = normalizeInteger(req.body.min_pace);
    if (min_pace === null) {
      return res
        .status(400)
        .json({ error: "min_pace must be a valid integer" });
    }
    if (min_pace < 0) {
      return res.status(400).json({ error: "min_pace must be 0 or greater" });
    }
    updates.push("min_pace = ?");
    values.push(min_pace);
  }

  if (hasMaxPace) {
    const max_pace = normalizeInteger(req.body.max_pace);
    if (max_pace === null) {
      return res
        .status(400)
        .json({ error: "max_pace must be a valid integer" });
    }
    if (max_pace < 0) {
      return res.status(400).json({ error: "max_pace must be 0 or greater" });
    }
    updates.push("max_pace = ?");
    values.push(max_pace);
  }

  if (hasMinDistPref) {
    const min_dist_pref = normalizeInteger(req.body.min_dist_pref);
    if (min_dist_pref === null) {
      return res
        .status(400)
        .json({ error: "min_dist_pref must be a valid integer" });
    }
    if (min_dist_pref < 0) {
      return res
        .status(400)
        .json({ error: "min_dist_pref must be 0 or greater" });
    }
    updates.push("min_dist_pref = ?");
    values.push(min_dist_pref);
  }

  if (hasMaxDistPref) {
    const max_dist_pref = normalizeInteger(req.body.max_dist_pref);
    if (max_dist_pref === null) {
      return res
        .status(400)
        .json({ error: "max_dist_pref must be a valid integer" });
    }
    if (max_dist_pref < 0) {
      return res
        .status(400)
        .json({ error: "max_dist_pref must be 0 or greater" });
    }
    updates.push("max_dist_pref = ?");
    values.push(max_dist_pref);
  }

  // Cross-field validation: min_pace <= max_pace
  const minPaceValue = hasMinPace ? normalizeInteger(req.body.min_pace) : null;
  const maxPaceValue = hasMaxPace ? normalizeInteger(req.body.max_pace) : null;

  // If both are being updated, check the new values
  if (
    hasMinPace &&
    hasMaxPace &&
    minPaceValue !== null &&
    maxPaceValue !== null
  ) {
    if (minPaceValue > maxPaceValue) {
      return res
        .status(400)
        .json({ error: "min_pace cannot be greater than max_pace" });
    }
  } else if (hasMinPace && minPaceValue !== null) {
    // If only min_pace is being updated, check against current max_pace
    const currentMaxPace = req.user.max_pace;
    if (minPaceValue > currentMaxPace) {
      return res
        .status(400)
        .json({ error: "min_pace cannot be greater than current max_pace" });
    }
  } else if (hasMaxPace && maxPaceValue !== null) {
    // If only max_pace is being updated, check against current min_pace
    const currentMinPace = req.user.min_pace;
    if (currentMinPace > maxPaceValue) {
      return res
        .status(400)
        .json({ error: "max_pace cannot be less than current min_pace" });
    }
  }

  // Cross-field validation: min_dist_pref <= max_dist_pref
  const minDistValue = hasMinDistPref
    ? normalizeInteger(req.body.min_dist_pref)
    : null;
  const maxDistValue = hasMaxDistPref
    ? normalizeInteger(req.body.max_dist_pref)
    : null;

  if (
    hasMinDistPref &&
    hasMaxDistPref &&
    minDistValue !== null &&
    maxDistValue !== null
  ) {
    if (minDistValue > maxDistValue) {
      return res
        .status(400)
        .json({ error: "min_dist_pref cannot be greater than max_dist_pref" });
    }
  } else if (hasMinDistPref && minDistValue !== null) {
    const currentMaxDist = req.user.max_dist_pref;
    if (minDistValue > currentMaxDist) {
      return res.status(400).json({
        error: "min_dist_pref cannot be greater than current max_dist_pref",
      });
    }
  } else if (hasMaxDistPref && maxDistValue !== null) {
    const currentMinDist = req.user.min_dist_pref;
    if (currentMinDist > maxDistValue) {
      return res.status(400).json({
        error: "max_dist_pref cannot be less than current min_dist_pref",
      });
    }
  }

  // Add runner_id to values for WHERE clause
  values.push(runnerId);

  // Build and execute UPDATE query
  const sql = `
    UPDATE runners
    SET ${updates.join(", ")}
    WHERE runner_id = ?
  `;

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database update failed:", err);
      return res.status(500).json({ error: "Failed to update profile" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // I have to subquery in order to get the updated runner
    db.query(
      "SELECT runner_id, first_name, last_name, middle_initial, email, is_leader, is_admin, min_pace, max_pace, min_dist_pref, max_dist_pref FROM runners WHERE runner_id = ?",
      [runnerId],
      (fetchErr, fetchResults) => {
        if (fetchErr) {
          console.error("Database error fetching updated user:", fetchErr);
          return res.status(500).json({
            error: "Profile updated but failed to fetch updated data",
          });
        }

        if (fetchResults.length === 0) {
          return res.status(404).json({ error: "User not found after update" });
        }

        // Generate new JWT token with updated user data
        const updatedUser = fetchResults[0];
        const token = generateJWT(updatedUser);

        // Update the HTTP-only cookie with new token
        res.cookie("CMIYC", token, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
          message: "Profile updated successfully",
          user: updatedUser,
        });
      }
    );
  });
});

// PUT: change user password (requires authentication)
router.put("/api/edit-password", verifyToken, async (req, res) => {
  const runnerId = req.user?.runner_id;

  if (!runnerId) {
    return res.status(401).json({ error: "Unauthorized: must be logged in" });
  }

  const { old_password, new_password } = req.body;

  // Validate required fields
  if (!old_password || !new_password) {
    return res
      .status(400)
      .json({ error: "old_password and new_password are required" });
  }

  // Validate new password length
  if (new_password.length < PASSWORD_MIN_LENGTH) {
    return res.status(400).json({
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
    });
  }

  // Validate password is not the same as the old
  if (old_password === new_password) {
    return res
      .status(400)
      .json({ error: "New password cannot be the same as the old Password" });
  }

  try {
    // Get current password hash from database
    const currentPasswordHash = await new Promise((resolve, reject) => {
      db.query(
        "SELECT user_password FROM runners WHERE runner_id = ?",
        [runnerId],
        (err, results) => {
          if (err) {
            reject(err);
          } else if (results.length === 0) {
            reject(new Error("User not found"));
          } else {
            resolve(results[0].user_password);
          }
        }
      );
    });

    // Verify old password matches
    const isOldPasswordCorrect = await verifyPassword(
      currentPasswordHash,
      old_password
    );
    if (!isOldPasswordCorrect) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Check if new password already exists for another user
    const existingPasswordHashes = await new Promise((resolve, reject) => {
      db.query(
        "SELECT user_password FROM runners WHERE runner_id <> ?",
        [runnerId],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results.map((row) => row.user_password));
          }
        }
      );
    });

    // Verify new password against all existing password hashes
    for (const existingHash of existingPasswordHashes) {
      const passwordMatches = await verifyPassword(existingHash, new_password);
      if (passwordMatches) {
        return res.status(409).json({
          error: "Password Unavailable",
        });
      }
    }

    // Hash the new password
    const hashedNewPassword = await hashPassword(new_password);

    // Update password in database
    db.query(
      "UPDATE runners SET user_password = ? WHERE runner_id = ?",
      [hashedNewPassword, runnerId],
      (err, result) => {
        if (err) {
          console.error("Database update failed:", err);
          return res.status(500).json({ error: "Failed to update password" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        res.json({
          message: "Password updated successfully",
        });
      }
    );
  } catch (error) {
    console.error("Error changing password:", error);
    if (error.message === "User not found") {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(500).json({ error: "Failed to change password" });
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
  const {
    start_lat,
    start_lng,
    end_lat,
    end_lng,
    start_address,
    end_address,
    polyline,
    distance,
  } = req.body;

  if (!runnerId) {
    return res.status(401).json({ error: "Unauthorized: must be logged in" });
  }

  // Validate required fields
  if (
    !start_lat ||
    !start_lng ||
    !end_lat ||
    !end_lng ||
    !polyline ||
    !distance
  ) {
    return res.status(400).json({ error: "Missing required route fields" });
  }

  // Insert route into routes table
  const insertRouteSql = `
    INSERT INTO routes (start_lat, start_lng, end_lat, end_lng, start_address, end_address, polyline, distance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertRouteSql,
    [
      start_lat,
      start_lng,
      end_lat,
      end_lng,
      start_address || null,
      end_address || null,
      polyline,
      distance,
    ],
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
          return res
            .status(500)
            .json({ error: "Route saved, but failed to link to user" });
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
router.post("/api/runs", verifyToken, (req, res) => {
  const runnerId = req.user?.runner_id;

  if (!runnerId) {
    return res.status(401).json({ error: "Unauthorized: must be logged in" });
  }

  // Check if user is a leader
  const checkLeaderSql = `SELECT is_leader FROM runners WHERE runner_id = ?`;
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

    // Extract all fields from request
    const {
      run_route,
      run_status_id,
      name,
      description,
      pace,
      date,
      start_time,
    } = req.body;

    // Validate required fields (status not required)
    if (!run_route || !name || pace === undefined || !date || !start_time) {
      return res.status(400).json({ error: "Missing required run fields" });
    }

    // Default run_status_id to 1 (Scheduled) if not provided
    const statusId = run_status_id && !isNaN(run_status_id) ? run_status_id : 1;

    const insertRunSql = `
      INSERT INTO runs
        (leader_id, run_route, run_status_id, name, description, pace, date, start_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      runnerId,
      run_route,
      statusId,
      name,
      description || null,
      pace,
      date,
      start_time,
    ];

    db.query(insertRunSql, values, (err, result) => {
      if (err) {
        console.error("Error creating run:", err);
        return res.status(500).json({ error: "Failed to create run" });
      }

      const runId = result.insertId;

      const participationSql = `
        INSERT INTO run_participation (participation_runner_id, participation_run_id)
        VALUES (?, ?)
      `;

      db.query(participationSql, [runnerId, runId], (err) => {
        if (err) {
          console.error("Error adding leader to participation:", err);
        }

        res.status(201).json({
          message: "Run created successfully",
          run_id: runId,
        });
      });
    });
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

// POST: join a run
router.post("/api/runs/:runId/join", verifyToken, (req, res) => {
  const runnerId = req.user?.runner_id;
  const { runId } = req.params;

  if (!runnerId) {
    return res.status(401).json({ error: "Unauthorized: must be logged in" });
  }

  if (!runId) {
    return res.status(400).json({ error: "Run ID is required" });
  }

  // Check if run exists
  db.query(
    "SELECT run_id FROM runs WHERE run_id = ?",
    [runId],
    (err, result) => {
      if (err) {
        console.error("Error checking run:", err);
        return res.status(500).json({ error: "Failed to verify run" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "Run not found" });
      }

      // Insert participation (use INSERT IGNORE to prevent duplicates)
      const sql = `
      INSERT IGNORE INTO run_participation (participation_runner_id, participation_run_id)
      VALUES (?, ?)
    `;

      db.query(sql, [runnerId, runId], (partErr, partResult) => {
        if (partErr) {
          console.error("Error joining run:", partErr);
          return res.status(500).json({ error: "Failed to join run" });
        }

        // Check if a row was actually inserted (0 means duplicate)
        if (partResult.affectedRows === 0) {
          return res
            .status(409)
            .json({ error: "Already participating in this run" });
        }

        res.status(201).json({ message: "Successfully joined run" });
      });
    }
  );
});

// DELETE: leave a run
router.delete("/api/runs/:runId/leave", verifyToken, (req, res) => {
  const runnerId = req.user?.runner_id;
  const { runId } = req.params;

  if (!runnerId) {
    return res.status(401).json({ error: "Unauthorized: must be logged in" });
  }

  if (!runId) {
    return res.status(400).json({ error: "Run ID is required" });
  }

  const sql = `
    DELETE FROM run_participation
    WHERE participation_runner_id = ? AND participation_run_id = ?
  `;

  db.query(sql, [runnerId, runId], (err, result) => {
    if (err) {
      console.error("Error leaving run:", err);
      return res.status(500).json({ error: "Failed to leave run" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Participation not found" });
    }

    res.json({ message: "Successfully left run" });
  });
});

// GET user's runs (scheduled or past)
router.get("/api/my-runs", verifyToken, (req, res) => {
  const runnerId = req.user?.runner_id;
  const { filter } = req.query; // "scheduled" or "past"

  if (!runnerId) {
    return res.status(401).json({ error: "Unauthorized: must be logged in" });
  }

  // Build the date condition based on filter
  let dateCondition = "";
  if (filter === "scheduled") {
    dateCondition = "AND r.date >= CURDATE()";
  } else if (filter === "past") {
    dateCondition = "AND r.date < CURDATE()";
  }

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
      TIME_FORMAT(r.start_time, '%H:%i:%s') AS start_time,
      rt.start_lat,
      rt.start_lng,
      rt.end_lat,
      rt.end_lng,
      rt.start_address,
      rt.end_address,
      rt.polyline,
      rt.distance,
      CONCAT(leader.first_name, ' ', leader.last_name) AS leader_name
    FROM run_participation rp
    JOIN runs r ON rp.participation_run_id = r.run_id
    JOIN status s ON r.run_status_id = s.status_id
    JOIN routes rt ON r.run_route = rt.route_id
    JOIN runners leader ON r.leader_id = leader.runner_id
    WHERE rp.participation_runner_id = ?
    ${dateCondition}
    ORDER BY r.date ASC, r.start_time ASC
  `;

  db.query(sql, [runnerId], (err, results) => {
    if (err) {
      console.error("Database query failed:", err);
      return res.status(500).json({ error: "Failed to fetch runs" });
    }

    res.json(results);
  });
});

// DELETE a specific run
router.delete("/api/runs/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const runnerId = req.user?.runner_id;

  if (!runnerId) {
    return res.status(401).json({ error: "Unauthorized: must be logged in" });
  }

  // First check if the user is the leader of this run
  db.query(
    "SELECT leader_id FROM runs WHERE run_id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Error checking run leader:", err);
        return res
          .status(500)
          .json({ error: "Failed to verify run ownership" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "Run not found" });
      }

      if (result[0].leader_id !== runnerId) {
        return res
          .status(403)
          .json({ error: "Only the run leader can delete the run" });
      }

      // Delete all participations first (to handle foreign key constraint)
      db.query(
        "DELETE FROM run_participation WHERE participation_run_id = ?",
        [id],
        (partErr) => {
          if (partErr) {
            console.error("Error deleting participations:", partErr);
            return res
              .status(500)
              .json({ error: "Failed to delete run participations" });
          }

          // Then delete the run
          db.query(
            "DELETE FROM runs WHERE run_id = ?",
            [id],
            (runErr, runResult) => {
              if (runErr) {
                console.error("Error deleting run:", runErr);
                return res.status(500).json({ error: "Failed to delete run" });
              }

              if (runResult.affectedRows === 0) {
                return res.status(404).json({ error: "Run not found" });
              }

              res.json({ message: "Run deleted successfully" });
            }
          );
        }
      );
    }
  );
});

// GET: profile statistics for the authenticated user
router.get("/api/profile-statistics", verifyToken, (req, res) => {
  const runnerId = req.user?.runner_id;

  if (!runnerId) {
    return res.status(401).json({ error: "Unauthorized: must be logged in" });
  }

  // Main statistics query - all runs (hosted + joined) - completed runs only
  const mainStatsSql = `
      SELECT
        -- Get total runs runner has joined
        COUNT(DISTINCT r.run_id) AS total_runs,
        -- get distance ran
        COALESCE(SUM(rt.distance), 0) AS total_distance,
        -- get avg pace
        COALESCE(AVG(r.pace), 0) AS average_pace,
        -- get fastet pace
        MIN(r.pace) AS fastest_pace,
        -- get longest run
        MAX(rt.distance) AS longest_run
      FROM runs as r 
      join routes as rt on r.run_route = rt.route_id
      join run_participation as rp on rp.participation_run_id = r.run_id
      where rp.participation_runner_id = ? and r.run_status_id = 2;
  `;

  // Leader-specific statistics query - completed runs only
  const leaderStatsSql = `
    WITH hosted_runs AS (
      SELECT * FROM runs
      WHERE leader_id = ?
      AND run_status_id = 2
    ),
    participants_per_run AS (
      SELECT rp.participation_run_id, COUNT(*) AS participant_count
      FROM run_participation rp
      JOIN hosted_runs hr 
      ON hr.run_id = rp.participation_run_id
      GROUP BY rp.participation_run_id
    )
    SELECT 
      (SELECT COUNT(*) FROM hosted_runs) AS runs_hosted,
      (SELECT SUM(participant_count) FROM participants_per_run) AS total_run_participants,
      (SELECT MAX(participant_count) FROM participants_per_run) AS max_participants,
      (SELECT AVG(r.distance)
	      FROM hosted_runs hr
        JOIN routes r ON r.route_id = hr.run_route) AS avg_hosted_dist,
      (SELECT AVG(pace) FROM hosted_runs) AS avg_hosted_pace;
  `;

  // Execute main stats query
  db.query(mainStatsSql, [runnerId, runnerId], (err, mainResults) => {
    if (err) {
      console.error("Database query failed:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch profile statistics" });
    }

    // If user is a leader, fetch leader-specific stats
    if (req.user?.is_leader) {
      db.query(leaderStatsSql, [runnerId], (leaderErr, leaderResults) => {
        if (leaderErr) {
          console.error("Database query failed for leader stats:", leaderErr);
          return res
            .status(500)
            .json({ error: "Failed to fetch leader statistics" });
        }

        // return both queried results
        res.json({
          ...mainResults[0],
          ...leaderResults[0],
        });
      });
    } else {
      // Non-leaders only get main stats
      res.json(mainResults[0]);
    }
  });
});

// GET: most recent completed run for user
router.get("/api/most-recent-run", verifyToken, (req, res) => {
  const runnerId = req.user?.runner_id;

  if (!runnerId) {
    return res.status(401).json({ error: "Unauthorized: must be logged in" });
  }

  const sqlQuery = `
    select 
	    rt.start_lat, 
      rt.start_lng, 
      rt.end_lat, 
      rt.end_lng, 
      rt.polyline, 
      rt.distance, 
	    r.name, 
      r.description, 
      r.pace, 
      r.date, 
      r.start_time
    from routes as rt 
    join runs as r on rt.route_id = r.run_route 
    join run_participation as rp on rp.participation_run_id = r.run_id
    where rp.participation_runner_id = ? and r.run_status_id = 2
    order by r.date desc, r.start_time desc limit 1;
  `;

  db.query(sqlQuery, [runnerId], (err, queryResults) => {
    if (err) {
      console.error("Database query failed for most recent run:", err);
      return res.status(500).json({ error: "Failed to fetch most recent run" });
    }

    if (!queryResults || queryResults.length === 0) {
      return res.json(null);
    }

    res.json(queryResults[0]);
  });
});

// Admin API calls
// Get all runners
router.get("/api/runners", verifyToken, (req, res) => {
  const runnerId = req.user?.runner_id;

  if (!runnerId) {
    return res.status(401).json({ error: "Unauthorized: must be logged in" });
  }

  // request must be from admin
  if (!req.user.is_admin) {
    return res
      .status(401)
      .json({ error: "Unauthorized: user is not an admin" });
  }

  const sql = `select 
    runner_id, 
    CONCAT(first_name, ' ', COALESCE(middle_initial, ''), ' ', last_name) AS full_name, 
    email, 
    is_leader, 
    is_admin 
    from runners
    where runner_id <> ?;`;

  db.query(sql, [runnerId], (err, queryResults) => {
    if (err) {
      console.error("Database query failed for runners:", err);
      return res.status(500).json({ error: "Failed to fetch runners info" });
    }

    res.json(queryResults);
  });
});

//Make runner an admin (only grants admin status, cannot revoke)
router.put("/api/make-admin/:newAdminID", verifyToken, (req, res) => {
  const { newAdminID } = req.params;
  const runnerId = req.user?.runner_id;

  if (!runnerId) {
    return res.status(401).json({ error: "Unauthorized: must be logged in" });
  }

  // request must be from admin
  if (!req.user.is_admin) {
    return res
      .status(403)
      .json({ error: "Unauthorized: user is not an admin" });
  }

  // Only grant admin status (set to true)
  const updateSql = `UPDATE runners SET is_admin = 1 WHERE runner_id = ?`;
  db.query(updateSql, [newAdminID], (updateErr, updateResults) => {
    if (updateErr) {
      console.error("Database update failed:", updateErr);
      return res.status(500).json({ error: "Failed to update admin status" });
    }

    // Fetch updated user data
    const getUpdatedSql = `select 
      runner_id, 
      CONCAT(first_name, ' ', COALESCE(middle_initial, ''), ' ', last_name) AS full_name, 
      email, 
      is_leader, 
      is_admin 
      from runners
      where runner_id = ?;`;

    db.query(getUpdatedSql, [newAdminID], (fetchErr, fetchResults) => {
      if (fetchErr) {
        console.error("Database query failed:", fetchErr);
        return res
          .status(500)
          .json({ error: "Admin status updated but failed to fetch user" });
      }

      res.json({
        message: "User promoted to admin successfully",
        user: fetchResults[0],
      });
    });
  });
});

module.exports = router;
