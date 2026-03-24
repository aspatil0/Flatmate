import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authImg from '../assets/auth.png';

const Register = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // mock register logic
    console.log('Registering...', formData);
  };

  return (
    <div className="min-h-screen flex bg-white font-sans flex-row-reverse">
      {/* Right side Image (reversed for variety) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-purple-50 items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 to-primary-600/10"></div>
        <img src={authImg} alt="Join Flatmate" className="relative z-10 max-w-lg w-full drop-shadow-2xl rounded-[3rem]" />
        
        <div className="absolute top-10 right-10 text-right z-10">
          <div className="bg-white/60 backdrop-blur-lg p-6 rounded-2xl border border-white/40 shadow-xl max-w-sm inline-block text-left">
            <h3 className="text-xl font-bold text-dark-900 mb-2">Join 10,000+ Users</h3>
            <p className="text-gray-600 text-sm">Create a verified profile in minutes and unlock thousands of premium listings and trustworthy flatmates.</p>
          </div>
        </div>
      </div>

      {/* Left side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <Link to="/" className="absolute top-8 left-8 text-primary-600 font-semibold flex items-center gap-2 hover:text-primary-700 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Home
        </Link>
        
        <div className="w-full max-w-md mt-10 lg:mt-0">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl lg:text-4xl font-bold text-dark-900 mb-2">Create Account</h2>
            <p className="text-gray-500">Sign up to find your perfect flatmate and next home.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-dark-700 mb-2" htmlFor="firstName">First Name</label>
                <input 
                  id="firstName"
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300"
                  placeholder="John"
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-dark-700 mb-2" htmlFor="lastName">Last Name</label>
                <input 
                  id="lastName"
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2" htmlFor="email">Email Address</label>
              <input 
                id="email"
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300"
                placeholder="name@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2" htmlFor="password">Password</label>
              <input 
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300"
                placeholder="Create a strong password"
                required
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full bg-primary-600 text-white font-bold text-lg rounded-xl py-4 hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/20 transition-all duration-300 shadow-glow"
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500">
              Already have an account? <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 underline underline-offset-4 decoration-2">Log in instead</Link>
            </p>
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-400">
            By registering, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
