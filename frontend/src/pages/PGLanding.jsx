import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';

const PGLanding = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-dark-900 mb-6 tracking-tight">
            Welcome to the <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600">PG Portal</span>
          </h1>
          <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto">
            Whether you manage multiple PG properties or you are looking for your perfect bed in a shared space, we have got you covered.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Owner Card */}
            <div className="bg-white p-10 rounded-3xl shadow-soft border border-primary-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm relative z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <h2 className="text-2xl font-bold text-dark-900 mb-4 relative z-10 text-left">I am a PG Owner</h2>
              <p className="text-gray-500 text-left mb-8 relative z-10">
                Manage your properties, visually assign beds seamlessly, handle tenant requests, and scale your PG business easily.
              </p>
              <Link to="/pg/owner-login" className="block w-full bg-dark-900 text-white font-bold py-4 rounded-xl hover:bg-primary-600 hover:shadow-glow transition-all relative z-10 text-center">
                Owner Dashboard
              </Link>
            </div>

            {/* Tenant Card */}
            <div className="bg-white p-10 rounded-3xl shadow-soft border border-purple-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm relative z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <h2 className="text-2xl font-bold text-dark-900 mb-4 relative z-10 text-left">I want to Rent a PG</h2>
              <p className="text-gray-500 text-left mb-8 relative z-10">
                Find the best PGs in your city. Browse verified properties, view live bed availability, and book your seat instantly.
              </p>
              <Link to="/pg/tenant-dashboard" className="block w-full bg-dark-900 text-white font-bold py-4 rounded-xl hover:bg-purple-600 hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all relative z-10 text-center">
                Find my PG
              </Link>
            </div>
          </div>
          
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PGLanding;
