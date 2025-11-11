const express = require("express");
const router = express.Router();
const axios = require("axios");

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

module.exports = router;