import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

import Login from "./layout/login";
import Dashboard from "./layout/dashboard";

import NotFound from "./layout/notFound";

function App() {
  return (
      <Router>
            <Routes>
              <Route path="/" exec element={<Login />} />
              <Route path="Dashboard" element={<Dashboard/>}/>
              <Route path="*" element={<NotFound />} />
            </Routes>
      </Router>
  );
}

export default App;
