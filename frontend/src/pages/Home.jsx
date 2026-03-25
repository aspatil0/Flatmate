import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FeatureCard from '../components/FeatureCard';
import heroImg from '../assets/hero.png';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-50 via-white to-white opacity-70"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <span className="inline-block py-1 px-3 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-6 tracking-wide">
                #1 Flatmate Finding Platform
              </span>
              <h1 className="text-5xl lg:text-7xl font-bold text-dark-900 tracking-tight leading-tight mb-6">
                Find Your <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600">Perfect Flatmate</span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-500 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Connect with verified people, discover beautiful apartments, and experience stress-free living with our smart matching algorithm.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/register" className="w-full sm:w-auto btn-primary text-lg px-8 py-4">
                  Get Started
                </Link>
                <a href="#features" className="w-full sm:w-auto btn-outline text-lg px-8 py-4">
                  Explore Features
                </a>
              </div>
            </div>
            <div className="w-full lg:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-200 to-purple-200 rounded-[3rem] transform rotate-3 scale-105 opacity-50 blur-xl"></div>
              <img 
                src={heroImg} 
                alt="Modern apartment living" 
                className="relative z-10 w-full rounded-[2rem] shadow-2xl border-4 border-white/50 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-dark-900 mb-4">Why Choose Flatmate?</h2>
            <p className="text-gray-500 text-lg">Our premium platform is designed to make finding your next home and roommate as seamless and secure as possible.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
              title="Smart Matching"
              description="Our AI-driven algorithm connects you with roommates who share your lifestyle, habits, and preferences."
            />
            <FeatureCard 
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>}
              title="Verified Users"
              description="Every profile undergoes a strict verification process. We ensure you only interact with real, trustworthy people."
            />
            <FeatureCard 
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>}
              title="Location-based Search"
              description="Find flats exactly where you want to be. Use our interactive map to discover neighborhoods that fit your commute."
            />
            <FeatureCard 
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
              title="Budget Compatibility"
              description="Set your price range upfront. We’ll only show you matching flats and roommates that align with your financial goals."
            />
            <FeatureCard 
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>}
              title="Built-in Chat System"
              description="Connect instantly via our secure in-app messaging. Discuss details and get to know your potential flatmate safely."
            />
            <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl p-8 text-white flex flex-col justify-center items-center text-center hover:shadow-glow transition-all duration-300">
              <h3 className="text-2xl font-bold mb-4">Ready to start?</h3>
              <p className="opacity-90 mb-6">Join thousands of happy users finding their ideal flatmates today.</p>
              <Link to="/register" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors w-full">Create Account</Link>
            </div>
          </div>
        </div>
      </section>

      {/* PG Portal Section */}
      <section className="py-20 bg-dark-900 border-t border-dark-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block py-1 px-4 rounded-full bg-dark-800 text-primary-400 text-xs font-bold mb-6 tracking-widest uppercase border border-dark-700">
            Introducing Flatmate PG
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">
            Looking for a PG? <span className="text-gray-400">Or Own One?</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            We have launched a dedicated portal for Paying Guest accommodations. Experience RedBus-style visual bed selection, instant booking, and seamless property management for PG owners.
          </p>
          <Link to="/pg" className="inline-block bg-gradient-to-r from-primary-600 to-purple-600 text-white font-bold text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-glow hover:-translate-y-1 transition-all duration-300">
            Explore PG Portal
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-dark-900 mb-4">How It Works</h2>
            <p className="text-gray-500 text-lg">Three simple steps to finding your ideal living situation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gray-100 z-0"></div>
            
            {/* Steps */}
            {[
              { num: '01', title: 'Create Profile', desc: 'Sign up and tell us about your habits, budget, and desired location.' },
              { num: '02', title: 'Discover Matches', desc: 'Browse curated suggestions of flats and roommates tailored just for you.' },
              { num: '03', title: 'Connect & Move In', desc: 'Chat safely, meet up, finalize agreements, and start your new chapter.' }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white border-4 border-primary-50 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600 mb-6 shadow-sm">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-dark-900 mb-3">{step.title}</h3>
                <p className="text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-dark-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Loved by Modern Renters</h2>
            <p className="text-gray-400 text-lg">Don't just take our word for it. Here is what our users say.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-dark-800/50 backdrop-blur-md p-8 rounded-2xl border border-dark-700">
              <div className="flex text-yellow-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                ))}
              </div>
              <p className="text-gray-300 italic mb-6">"Finding a flatmate used to be a nightmare of endless Facebook groups. Flatmate matched me with Sarah in 2 days, and our living habits are perfectly aligned. It felt like magic!"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center font-bold text-lg mr-4">M</div>
                <div>
                  <h4 className="font-semibold">Michael Chen</h4>
                  <p className="text-sm text-gray-400">Software Engineer, NYC</p>
                </div>
              </div>
            </div>
            
            <div className="bg-dark-800/50 backdrop-blur-md p-8 rounded-2xl border border-dark-700">
              <div className="flex text-yellow-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                ))}
              </div>
              <p className="text-gray-300 italic mb-6">"The verified user feature gave me so much peace of mind. The UI is gorgeous, the chat is smooth, and I found a stunning room within my exact budget. Highly recommended."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center font-bold text-lg mr-4">E</div>
                <div>
                  <h4 className="font-semibold">Emma Roberts</h4>
                  <p className="text-sm text-gray-400">Freelance Designer, LA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Start Your Flatmate Journey Today</h2>
          <p className="text-primary-100 text-lg md:text-xl mb-10">
            Join the community of verified renters finding their perfect homes. It takes 2 minutes to set up your profile.
          </p>
          <Link to="/register" className="inline-block bg-white text-primary-600 font-bold text-lg px-10 py-5 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            Create Your Free Account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
