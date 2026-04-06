import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePGOwnerAuth } from '../context/PGOwnerAuthContext';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const PGOwnerLogin = () => {
  const navigate = useNavigate();
  const { loginPGOwner, loading, error: contextError } = usePGOwnerAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccess('');

    // Validation
    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      await loginPGOwner(formData.email, formData.password);
      setSuccess('Login successful! Redirecting to dashboard...');
      setTimeout(() => navigate('/pg/owner-dashboard-new'), 2000);
    } catch (err) {
      setLocalError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <NavBar />
      
      <main className="flex-grow pt-20 pb-20">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h1 className="text-3xl font-bold text-dark-900 mb-2 text-center">
              PG Owner Login
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Manage your PG properties with ease
            </p>

            {(localError || contextError) && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {localError || contextError}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="text-center mt-6 text-gray-600">
              Don't have an account?{' '}
              <Link to="/pg/owner-register" className="text-primary-600 hover:text-primary-700 font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PGOwnerLogin;
