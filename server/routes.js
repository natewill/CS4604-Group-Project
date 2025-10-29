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

  }


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

    // build runner_data dict
    const runner_data = {
      first_name,
      last_name,
      middle_initial,
      email,
      user_password: null,   // gets filled in signup()
      is_leader: !!is_leader,
      min_pace,
      max_pace,
      min_dist_pref,
      max_dist_pref,
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
})

module.exports = router;
