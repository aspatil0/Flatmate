import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MOCK_PROPERTIES = [
  {
    id: 1,
    name: 'Aditya Residency PG',
    city: 'Pune',
    locality: 'Katraj',
    rent: 6500,
    ownerPhone: '+91 8669792979',
    flats: Array.from({ length: 40 }, (_, f_idx) => ({
      id: `f-${f_idx + 1}`,
      flatNumber: 101 + f_idx,
      beds: [
        { id: `b-${f_idx + 1}-1`, isBooked: Math.random() > 0.8 },
        { id: `b-${f_idx + 1}-2`, isBooked: Math.random() > 0.8 },
        { id: `b-${f_idx + 1}-3`, isBooked: Math.random() > 0.8 },
      ]
    }))
  },
  {
    id: 2,
    name: 'Sunrise PG for Boys',
    city: 'Pune',
    locality: 'Wakad',
    rent: 5500,
    ownerPhone: '+91 9876543210',
    flats: Array.from({ length: 10 }, (_, f_idx) => ({
      id: `f2-${f_idx + 1}`,
      flatNumber: 201 + f_idx,
      beds: [
        { id: `b2-${f_idx + 1}-1`, isBooked: Math.random() > 0.5 },
        { id: `b2-${f_idx + 1}-2`, isBooked: Math.random() > 0.5 },
      ]
    }))
  }
];

const PGTenantDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [bookSuccess, setBookSuccess] = useState(null); // bedId of successful mock booking

  const filteredProperties = MOCK_PROPERTIES.filter(p => {
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || 
           p.city.toLowerCase().includes(q) || 
           p.locality.toLowerCase().includes(q);
  });

  const handleBookSeat = (bedId) => {
    // Mock the booking flow
    setBookSuccess(bedId);
    setTimeout(() => {
      setBookSuccess(null);
    }, 4000);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 md:w-80 bg-white border-r border-gray-100 flex flex-col shadow-sm z-10 flex-shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <Link to="/pg" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 tracking-tight block">
            PG Finder
          </Link>
          <span className="text-xs font-bold bg-purple-100 text-purple-600 px-2 py-1 rounded">TENANT</span>
        </div>
        
        <div className="p-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Search Location</h3>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search Katraj, Wakad..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedProperty(null); // Reset selection on search
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-purple-500"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-2 pb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Results ({filteredProperties.length})</h3>
          {filteredProperties.map(p => (
            <button 
              key={p.id}
              onClick={() => setSelectedProperty(p)}
              className={`w-full text-left p-4 rounded-xl transition-all border ${selectedProperty?.id === p.id ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-white border-gray-100 hover:border-purple-200 hover:shadow-sm'}`}
            >
              <h4 className="font-bold text-dark-900">{p.name}</h4>
              <p className="text-xs text-gray-500 mb-2">{p.locality}, {p.city}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-purple-600">₹{p.rent}/mo</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">Available</span>
              </div>
            </button>
          ))}
          {filteredProperties.length === 0 && (
            <div className="text-center p-4 text-gray-400 text-sm">
              No PGs found in this area.
            </div>
          )}
        </div>

        <div className="mt-auto p-4 border-t border-gray-100">
          <button onClick={() => navigate('/pg')} className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span>Exit Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 p-6 sm:p-10 relative">
        {selectedProperty ? (
          <div className="max-w-6xl mx-auto pb-20">
            <header className="mb-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-dark-900 mb-2">{selectedProperty.name}</h1>
                  <p className="text-gray-500 flex items-center text-lg">
                    <svg className="w-5 h-5 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {selectedProperty.locality}, {selectedProperty.city}
                  </p>
                </div>
                
                <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-800 uppercase">Contact Owner</p>
                    <p className="font-bold text-dark-900 text-lg">{selectedProperty.ownerPhone}</p>
                  </div>
                </div>
              </div>
            </header>

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-dark-900 mb-1">Select Your Bed</h2>
                <p className="text-gray-500 text-sm">Click any available green bed to instantly send a request.</p>
              </div>
              <div className="flex gap-4 text-sm font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                <span className="flex items-center"><div className="w-4 h-4 bg-green-500 rounded mr-2"></div> Available</span>
                <span className="flex items-center"><div className="w-4 h-4 bg-red-500 rounded mr-2"></div> Booked</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {selectedProperty.flats.map(flat => (
                <div key={flat.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-lg text-dark-900">Flat {flat.flatNumber}</h3>
                  </div>
                  
                  {/* Bed Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {flat.beds.map((bed, idx) => (
                      <div key={bed.id} className="relative group">
                        <button
                          disabled={bed.isBooked}
                          onClick={() => handleBookSeat(bed.id)}
                          className={`
                            w-full relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all 
                            ${bed.isBooked 
                              ? 'bg-red-50 border-red-200 opacity-70 cursor-not-allowed' 
                              : 'bg-green-50 border-green-200 hover:border-green-400 hover:shadow-glow cursor-pointer'}
                          `}
                        >
                          <svg className={`w-6 h-6 mb-1 ${bed.isBooked ? 'text-red-500' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg>
                          <span className={`text-xs font-bold ${bed.isBooked ? 'text-red-700' : 'text-green-700'}`}>
                            B{idx + 1}
                          </span>
                        </button>
                        
                        {/* Hover Tooltip - Simulated Members View */}
                        {!bed.isBooked && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-dark-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 shadow-xl">
                            <p className="font-bold mb-1 border-b border-dark-700 pb-1">Flat {flat.flatNumber} Details</p>
                            <p className="text-gray-300 mb-1">Total Rent: ₹{selectedProperty.rent}/mo</p>
                            <p className="text-gray-300">Click to instantly notify the owner you want this bed!</p>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-dark-900 rotate-45"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Booking Success Toast */}
            {bookSuccess && (
              <div className="fixed bottom-10 right-10 bg-dark-900 text-white p-6 rounded-2xl shadow-2xl z-50 animate-bounce max-w-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Request Sent!</h4>
                    <p className="text-gray-300 text-sm">We've notified the owner at <span className="text-white font-semibold">{selectedProperty.ownerPhone}</span>. They will call you shortly to confirm your seat!</p>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-10">
            <div className="w-24 h-24 bg-purple-50 text-purple-200 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-dark-900 mb-2">Search for a PG</h2>
            <p className="text-gray-500 max-w-sm">Use the sidebar to search for areas like 'Katraj' or 'Wakad' and select a PG to view its live bed layout.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PGTenantDashboard;
