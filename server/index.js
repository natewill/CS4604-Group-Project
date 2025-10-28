// import the libraries
const express = require("express"); //allows us to call endpoints
const cors = require("cors"); // Frontend to backend communication
const routes = require("./routes"); //import our defined routes

const app = express(); //create backend service
app.use(cors()); // front end calls backend
app.use(express.json()); // allows us to parse JSON bodies

app.use(routes); //router is now attached to the app

// Opens port and starts listening to requests that come from frontend
const PORT = 5050;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
