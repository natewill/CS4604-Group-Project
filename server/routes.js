const express = require("express");
const router = express.Router();
const db = require("./connection");
const { signup, signin, getPwAndIdFromEmail } = require("./accounts");

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
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "email required" });

  if(await getPwAndIdFromEmail(email)){
    return res.status(409).json({ error: "email_exists" });
  } 

  return res.json({available : true})
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
    const minPaceNum = min_pace !== undefined && min_pace !== null && min_pace !== "" ? Number(min_pace) : null;
    const maxPaceNum = max_pace !== undefined && max_pace !== null && max_pace !== "" ? Number(max_pace) : null;
    const minDistNum = min_dist_pref !== undefined && min_dist_pref !== null && min_dist_pref !== "" ? Number(min_dist_pref) : null;
    const maxDistNum = max_dist_pref !== undefined && max_dist_pref !== null && max_dist_pref !== "" ? Number(max_dist_pref) : null;

    if (minPaceNum !== null && maxPaceNum !== null && minPaceNum > maxPaceNum) {
      return res.status(400).json({ error: "min_pace cannot be greater than max_pace" });
    }
    if (minDistNum !== null && maxDistNum !== null && minDistNum > maxDistNum) {
      return res.status(400).json({ error: "min_dist_pref cannot be greater than max_dist_pref" });
    }

    // build runner_data dict
    const runner_data = {
      first_name,
      last_name,
      middle_initial,
      email: normEmail,
      user_password: null,   // gets filled in signup()
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
})

module.exports = router;
