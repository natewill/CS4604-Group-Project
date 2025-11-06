// import the libraries
const express = require("express"); //allows us to call endpoints
const cors = require("cors"); // Frontend to backend communication
const cookieParser = require("cookie-parser"); // Parse cookies
const routes = require("./routes"); //import our defined routes

const app = express(); //create backend service

// Configure CORS to allow credentials (cookies)
app.use(
  cors({
    origin: "http://localhost:3000", // Your React app URL
    credentials: true, // Allow cookies to be sent
  })
);

app.use(express.json()); // allows us to parse JSON bodies
app.use(cookieParser()); // Parse cookies from requests

app.use(routes); //router is now attached to the app

// Opens port and starts listening to requests that come from frontend

const PORT = 5050;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
