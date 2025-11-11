// server/server/db/connection.js
const mysql2 = require("mysql2");
require("dotenv").config();

const db = mysql2.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "password",
  database: process.env.DB_NAME || "cache_me_if_you_can_db",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database!");
  }
});

module.exports = db;
