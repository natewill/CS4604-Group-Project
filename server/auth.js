const jwt = require("jsonwebtoken");

// JWT Secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Generate JWT token for a user
 * @param {object} runner - The runner object from database (excluding password)
 * @returns {string} JWT token
 */
function generateJWT(runner) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  // Create copy of runner
  const tokenPayload = {
    runner_id: runner.runner_id,
    first_name: runner.first_name,
    last_name: runner.last_name,
    middle_initial: runner.middle_initial,
    email: runner.email,
    is_leader: runner.is_leader,
    min_pace: runner.min_pace,
    max_pace: runner.max_pace,
    min_dist_pref: runner.min_dist_pref,
    max_dist_pref: runner.max_dist_pref,
  };

  // return jwt with the runner object
  return jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

/**
 * Middleware to verify JWT token
 * Attaches full user info to req.user if token is valid
 */
function verifyToken(req, res, next) {
  if (!JWT_SECRET) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  // Get token from HTTP-only cookie
  const token = req.cookies?.CMIYC;

  // no token in request
  if (!token) {
    return res
      .status(401)
      .json({ error: "No token provided. Please sign in." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach runner info to the request as user = {all the runner data}
    // decoded is the runner object of the current user
    req.user = decoded;
    // next is used to continue to the next middle wear or route handler
    next();
  } catch (err) {
    // invalid tokens
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expired. Please sign in again." });
    }
    return res.status(401).json({ error: "Invalid token. Please sign in." });
  }
}

module.exports = {
  generateJWT,
  verifyToken,
};

