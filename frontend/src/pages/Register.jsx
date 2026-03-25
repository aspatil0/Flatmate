import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authImg from '../assets/auth.png';

const Register = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', termsAccepted: false, captchaAnswer: '' });
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, sum: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 9) + 1; // 1-9
    const n2 = Math.floor(Math.random() * 9) + 1; // 1-9
    setCaptcha({ num1: n1, num2: n2, sum: n1 + n2 });
    setFormData(prev => ({ ...prev, captchaAnswer: '' }));
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.termsAccepted) {
      setError('You must accept the Terms and Conditions to register.');
      return;
    }

    if (parseInt(formData.captchaAnswer) !== captcha.sum) {
      setError('Incorrect captcha answer. Please try again.');
      generateCaptcha();
      return;
    }

    // mock register logic
    console.log('Registering...', formData);
    alert('Registration successful!');
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
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-xl">
                {error}
              </div>
            )}
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

            <div className="flex items-start bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center h-5">
                <input 
                  id="terms" 
                  name="termsAccepted" 
                  type="checkbox" 
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500 cursor-pointer" 
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-dark-800 cursor-pointer">I agree to the <Link to="/contact" className="text-primary-600 hover:underline">Terms of Service</Link> & <Link to="/contact" className="text-primary-600 hover:underline">Privacy Policy</Link></label>
                <p className="text-xs text-gray-500 mt-1">By continuing, I confirm I am not a robot.</p>
              </div>
            </div>

            <div className="bg-primary-50/50 p-4 rounded-xl border border-primary-100/50">
              <label className="block text-sm font-medium text-dark-800 mb-2">Security Check: What is {captcha.num1} + {captcha.num2}?</label>
              <div className="flex gap-4 items-center">
                <input 
                  type="number"
                  name="captchaAnswer"
                  value={formData.captchaAnswer}
                  onChange={handleChange}
                  className="w-32 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-center font-bold"
                  placeholder="?"
                  required
                />
                <button type="button" onClick={generateCaptcha} className="text-xs font-semibold text-primary-600 hover:text-primary-700 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-100 transition-colors">
                  ↻ Reload
                </button>
              </div>
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
            Make sure to solve the security puzzle before continuing!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
