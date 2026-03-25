import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 tracking-tight mb-4 inline-block">
              Flatmate
            </Link>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              Find your perfect matching flatmate. Smart, verified, and budget-friendly living solutions for modern professionals and students.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-dark-900 mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-500 hover:text-primary-600 text-sm transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-600 text-sm transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-600 text-sm transition-colors">Safety</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-dark-900 mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-500 hover:text-primary-600 text-sm transition-colors">About</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-600 text-sm transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-600 text-sm transition-colors">Careers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-dark-900 mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/contact" className="text-gray-500 hover:text-primary-600 text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-primary-600 text-sm transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Flatmate. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {/* Social Icons (Placeholders) */}
            <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
