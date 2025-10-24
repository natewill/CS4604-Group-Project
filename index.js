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
  password: "password", // MySQL password
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

// Example route: get all rows from runners
app.get("/api/runners", (req, res) => {
  db.query("SELECT * FROM runners", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

//get a summary of the database
app.get("/api/summary", (req, res) => { //make a summary endpoint to display important parts of database
  db.query("SELECT DATABASE() AS name", (err, dbResult) => { //select name of database
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database query failed (name)" });
    }
    const dbName = dbResult[0].name;

    db.query("SELECT COUNT(*) AS count FROM runners", (err, runnersResult) => { //select number of rows in 'runners'
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query failed (runners)" });
      }
      const runnersCount = runnersResult[0].count;

      db.query("SELECT COUNT(*) AS count FROM runs", (err, runsResult) => { //select number of rows in 'runs'
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Database query failed (runs)" });
        }
        const runsCount = runsResult[0].count;

        // final response once all three are done in a json format
        res.json({ 
          dbName,
          runnersCount,
          runsCount,
        });
      });
    });
  });
});

app.use(express.static('public')); //display the home page

const PORT = 5050; 
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
