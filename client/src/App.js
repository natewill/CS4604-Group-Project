// client/src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateRoute from "./pages/CreateRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/create-route" element={<CreateRoute />} />
        {/* Catch-all (optional) */}
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
