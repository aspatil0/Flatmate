import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PGOwnerAuthProvider, usePGOwnerAuth } from './context/PGOwnerAuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import PGLanding from './pages/PGLanding';
import PGOwnerDashboard from './pages/PGOwnerDashboard';
import PGOwnerDashboardNew from './pages/PGOwnerDashboardNew';
import PGOwnerRegister from './pages/PGOwnerRegister';
import PGOwnerLogin from './pages/PGOwnerLogin';
import PGTenantDashboard from './pages/PGTenantDashboard';
import PGBrowse from './pages/PGBrowse';
import PGPropertyDetail from './pages/PGPropertyDetail';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function PGOwnerProtectedRoute({ children }) {
  const { pgOwner } = usePGOwnerAuth();
  const location = useLocation();

  if (!pgOwner) {
    return <Navigate to="/pg/owner-login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <PGOwnerAuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/contact" element={<Contact />} />
            
            {/* PG Routes */}
            <Route path="/pg/landing" element={<PGLanding />} />
            <Route path="/pg" element={<PGLanding />} />
            
            {/* PG Owner Routes */}
            <Route path="/pg/owner-register" element={<PGOwnerRegister />} />
            <Route path="/pg/owner-login" element={<PGOwnerLogin />} />
            <Route path="/pg/owner-dashboard" element={<PGOwnerProtectedRoute><PGOwnerDashboard /></PGOwnerProtectedRoute>} />
            <Route path="/pg/owner-dashboard-new" element={<PGOwnerProtectedRoute><PGOwnerDashboardNew /></PGOwnerProtectedRoute>} />
            
            {/* PG Tenant Routes */}
            <Route path="/pg/tenant-dashboard" element={<ProtectedRoute><PGTenantDashboard /></ProtectedRoute>} />
            <Route path="/pg/browse" element={<PGBrowse />} />
            <Route path="/pg/property/:propertyId" element={<PGPropertyDetail />} />
          </Routes>
        </PGOwnerAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
