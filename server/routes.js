const express = require("express");
const router = express.Router();
const db = require("./connection");

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

module.exports = router;
