import React from 'react';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 mb-10">
            <h1 className="text-4xl font-bold text-dark-900 mb-6 tracking-tight">Contact Us</h1>
            <p className="text-gray-500 text-lg mb-8">We would love to hear from you. Reach out to us for any inquiries, support, or feedback.</p>
            
            <div className="flex items-center space-x-4 bg-primary-50 p-6 rounded-2xl border border-primary-100 mb-8 inline-flex">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-600 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </div>
              <div>
                <p className="text-sm text-primary-900 font-medium mb-1">Call Support</p>
                <p className="text-2xl font-bold text-primary-700">+91 9370715838</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 text-gray-700">
            <h2 className="text-3xl font-bold text-dark-900 mb-8">Terms and Conditions</h2>
            
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-bold text-dark-900 mb-3">1. Acceptance of Terms</h3>
                <p className="leading-relaxed">By accessing and using the Flatmate application, you agree to comply with and be bound by these legal terms and conditions. If you do not agree, please do not use our services.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-dark-900 mb-3">2. User Responsibilities</h3>
                <p className="leading-relaxed">Platform users are solely responsible for the accuracy of listing details, interactions with other users, and ensuring safety when scheduling meetups. We act solely as a discovery platform and do not participate in lease agreements.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-dark-900 mb-3">3. Privacy and Data Usage</h3>
                <p className="leading-relaxed">Your privacy is important to us. Information provided while using our platform, including contact numbers, is protected strictly in accordance with our Privacy Policy and local legal standards.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-dark-900 mb-3">4. Content Ownership</h3>
                <p className="leading-relaxed">All content posted by users remains their property, but by posting on Flatmate, you grant us a license to use, reproduce, and display that content in connection with providing our services.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-dark-900 mb-3">5. Disclaimer of Warranties</h3>
                <p className="leading-relaxed">The Flatmate service is provided "as is" and "as available". We do not warrant that the service will be uninterrupted, error-free, or completely secure. Use caution and common sense when transacting with potential flatmates.</p>
              </section>
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
