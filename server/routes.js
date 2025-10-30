const express = require("express");
const router = express.Router();
const db = require("./connection");
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

// Validate Address
router.post("/api/validate-address", async (req, res) => {
  try {
    const { address, addressLines, regionCode = "US" } = req.body || {};
    const lines = Array.isArray(addressLines)
      ? addressLines
      : typeof address === "string"
      ? [address]
      : [];

    if (!lines.length) {
      return res.status(400).json({ error: "Missing address" });
    }

    const url = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const body = { address: { regionCode, addressLines: lines } };
    const { data } = await axios.post(url, body);
    res.json(data);
  } catch (err) {
    console.error(
      "/api/validate-address error",
      err.response?.data || err.message
    );
    res.status(500).json({ error: "Address validation failed" });
  }
});

// Post to insert a new Route into database
router.post("/api/save-route", async (req, res) => {
  const { start_lat, start_lng, end_lat, end_lng, polyline, distance } =
    req.body;

  db.query(
    `INSERT INTO routes (start_lat, start_lng, end_lat, end_lng, polyline, distance)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [start_lat, start_lng, end_lat, end_lng, polyline, distance],
    (err, results) => {
      //errror
      if (err) {
        console.error("/api/save-route error", err);
        return res.status(500).json({ error: "Failed to save route." });
      }

      // No Error
      console.log("Inserted route ID:", results.insertId);
      res.status(201).json({
        message: "Route saved successfully",
        route_id: results.insertId,
      });
    }
  );
});

module.exports = router;
