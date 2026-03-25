import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import PGLanding from './pages/PGLanding';
import PGOwnerDashboard from './pages/PGOwnerDashboard';
import PGTenantDashboard from './pages/PGTenantDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pg" element={<PGLanding />} />
        <Route path="/pg/owner-dashboard" element={<PGOwnerDashboard />} />
        <Route path="/pg/tenant-dashboard" element={<PGTenantDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
