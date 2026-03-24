import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authImg from '../assets/auth.png';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // mock login logic
    console.log('Logging in...', formData);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left side Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary-50 items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-purple-600/10"></div>
        <img src={authImg} alt="Welcome to Flatmate" className="relative z-10 max-w-lg w-full drop-shadow-2xl rounded-[3rem]" />
        
        <div className="absolute bottom-10 left-10 right-10 z-10 text-center">
          <div className="bg-white/60 backdrop-blur-lg p-6 rounded-2xl border border-white/40 shadow-xl max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-dark-900 mb-2">Welcome Back</h3>
            <p className="text-gray-600">Your perfect flatmate is waiting for you. Log in to continue your search.</p>
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <Link to="/" className="absolute top-8 left-8 text-primary-600 font-semibold flex items-center gap-2 hover:text-primary-700 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Home
        </Link>
        
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl lg:text-4xl font-bold text-dark-900 mb-2">Log In to Flatmate</h2>
            <p className="text-gray-500">Enter your details below to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2" htmlFor="email">Email Address</label>
              <input 
                id="email"
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300"
                placeholder="name@example.com"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-dark-700" htmlFor="password">Password</label>
                <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700">Forgot password?</a>
              </div>
              <input 
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-dark-900 text-white font-medium text-lg rounded-xl py-4 hover:bg-primary-600 focus:ring-4 focus:ring-primary-500/20 transition-all duration-300 shadow-soft hover:shadow-glow"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500">
              Don't have an account? <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 underline underline-offset-4 decoration-2">Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
