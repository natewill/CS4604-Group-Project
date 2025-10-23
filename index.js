// import the libraries
const express = require("express"); //allows us to call endpoints
const mysql2 = require("mysql2"); //allows us to connect to MySQL database
const cors = require("cors"); // Frontend to backend communication

const app = express(); //create backend service
app.use(cors()); // front end calls backend
app.use(express.json()); // allows us to parse JSON bodies

// Connect to local MySQL database
const db = mysql2.createConnection({
  host: "localhost", // MySQL server
  user: "root", // MySQL username
  password: "St33lers", // MySQL password
  database: "cache_me_if_you_can_db", // This specifies which database to use
});

// This creates a connection between our backend and the database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database!");
});

// its the sql command then a callback function (err if any, results from query)
db.query("SELECT * FROM route_points", (err, results) => {
  if (err) {
    console.error(err);
  } else {
    console.log(results);
  }
});

// Example route: get all rows from 'mytable'
app.get("/api/mytable", (req, res) => {
  db.query("SELECT * FROM route_points", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
