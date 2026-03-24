import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#features' },
    { name: 'About', path: '/#how-it-works' },
    { name: 'Contact', path: '/#contact' },
  ];

  const handleScrollTo = (e, path) => {
    if (path.startsWith('/#')) {
      const id = path.substring(2);
      const element = document.getElementById(id);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 tracking-tight">
          Flatmate
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={(e) => handleScrollTo(e, link.path)}
              className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                location.pathname === '/' && !link.path.includes('#') 
                  ? 'text-primary-600' 
                  : 'text-dark-700'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            to="/login"
            className="text-dark-700 hover:text-primary-600 font-medium text-sm transition-colors py-2 px-4 rounded-lg hover:bg-dark-50"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="bg-dark-900 text-white hover:bg-primary-600 font-medium text-sm transition-all duration-300 py-2.5 px-5 rounded-lg shadow-soft hover:shadow-glow"
          >
            Start for free
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
