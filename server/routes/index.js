const express = require("express");
const router = express.Router();

// Import route modules
const googleMapsRoutes = require("./googleMaps");
const authRoutes = require("./authRoutes");
const profileRoutes = require("./profileRoutes");
const routeRoutes = require("./routeRoutes");
const runRoutes = require("./runRoutes");
const adminRoutes = require("./adminRoutes");

// Mount route modules
router.use(authRoutes);
router.use(profileRoutes);
router.use(routeRoutes);
router.use(runRoutes);
router.use(adminRoutes);
router.use(googleMapsRoutes);

module.exports = router;
