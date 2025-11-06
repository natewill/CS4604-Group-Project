const express = require("express");
const router = express.Router();

// Import route modules
const googleMapsRoutes = require("./googleMaps");
const databaseRoutes = require("./database");

// Mount route modules
router.use(googleMapsRoutes);
router.use(databaseRoutes);

module.exports = router;
