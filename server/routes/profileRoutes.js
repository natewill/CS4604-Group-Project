const express = require("express");
const router = express.Router();
const db = require("../connection");
const { hashPassword, verifyPassword } = require("../accounts");
const { generateJWT, verifyToken } = require("../auth");
const { normalizeString, normalizeInteger } = require("../utils/validation");

const PASSWORD_MIN_LENGTH = 6;

// PUT: update user profile (requires authentication)
router.put("/api/edit-profile", verifyToken, async (req, res) => {
  const runnerId = req.user?.runner_id;

  if (!runnerId) {
    return res.status(401).json({ error: "Unauthorized: must be logged in" });
  }

  const hasFirstName = "first_name" in req.body;
  const hasMiddleInitial = "middle_initial" in req.body;
  const hasLastName = "last_name" in req.body;
  const hasEmail = "email" in req.body;
  const hasMinPace = "min_pace" in req.body;
  const hasMaxPace = "max_pace" in req.body;
  const hasMinDistPref = "min_dist_pref" in req.body;
  const hasMaxDistPref = "max_dist_pref" in req.body;

  const updates = [];
  const values = [];

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

  const minPaceValue = hasMinPace ? normalizeInteger(req.body.min_pace) : null;
  const maxPaceValue = hasMaxPace ? normalizeInteger(req.body.max_pace) : null;

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
    const currentMaxPace = req.user.max_pace;
    if (minPaceValue > currentMaxPace) {
      return res
        .status(400)
        .json({ error: "min_pace cannot be greater than current max_pace" });
    }
  } else if (hasMaxPace && maxPaceValue !== null) {
    const currentMinPace = req.user.min_pace;
    if (currentMinPace > maxPaceValue) {
      return res
        .status(400)
        .json({ error: "max_pace cannot be less than current min_pace" });
    }
  }

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

  values.push(runnerId);

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

        const updatedUser = fetchResults[0];
        const token = generateJWT(updatedUser);

        res.cookie("CMIYC", token, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
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

  if (!old_password || !new_password) {
    return res
      .status(400)
      .json({ error: "old_password and new_password are required" });
  }

  if (new_password.length < PASSWORD_MIN_LENGTH) {
    return res.status(400).json({
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
    });
  }

  if (old_password === new_password) {
    return res
      .status(400)
      .json({ error: "New password cannot be the same as the old Password" });
  }

  try {
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

    const isOldPasswordCorrect = await verifyPassword(
      currentPasswordHash,
      old_password
    );
    if (!isOldPasswordCorrect) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

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

    for (const existingHash of existingPasswordHashes) {
      const passwordMatches = await verifyPassword(existingHash, new_password);
      if (passwordMatches) {
        return res.status(409).json({
          error: "Password Unavailable",
        });
      }
    }

    const hashedNewPassword = await hashPassword(new_password);

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

// GET: profile statistics for the authenticated user
router.get("/api/profile-statistics", verifyToken, (req, res) => {
  const runnerId = req.user?.runner_id;

  if (!runnerId) {
    return res.status(401).json({ error: "Unauthorized: must be logged in" });
  }

  const mainStatsSql = `
      SELECT
        COUNT(DISTINCT r.run_id) AS total_runs,
        COALESCE(SUM(rt.distance), 0) AS total_distance,
        COALESCE(AVG(r.pace), 0) AS average_pace,
        MIN(r.pace) AS fastest_pace,
        MAX(rt.distance) AS longest_run
      FROM runs as r 
      join routes as rt on r.run_route = rt.route_id
      join run_participation as rp on rp.participation_run_id = r.run_id
      where rp.participation_runner_id = ? and r.date < CURDATE();
  `;

  const leaderStatsSql = `
    WITH hosted_runs AS (
      SELECT * FROM runs
      WHERE leader_id = ?
      AND date < CURDATE()
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

  db.query(mainStatsSql, [runnerId, runnerId], (err, mainResults) => {
    if (err) {
      console.error("Database query failed:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch profile statistics" });
    }

    if (req.user?.is_leader) {
      db.query(leaderStatsSql, [runnerId], (leaderErr, leaderResults) => {
        if (leaderErr) {
          console.error("Database query failed for leader stats:", leaderErr);
          return res
            .status(500)
            .json({ error: "Failed to fetch leader statistics" });
        }

        res.json({
          ...mainResults[0],
          ...leaderResults[0],
        });
      });
    } else {
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
    where rp.participation_runner_id = ? and r.date < CURDATE()
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

module.exports = router;
