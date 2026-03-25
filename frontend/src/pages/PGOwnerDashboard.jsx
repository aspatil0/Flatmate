import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import flat1 from '../assets/flat1.png';
import flat2 from '../assets/flat2.png';

const MOCK_PROPERTIES = [
  {
    id: 1,
    name: 'Aditya Residency',
    city: 'Pune',
    locality: 'Katraj',
    images: [flat1, flat2],
    // Generate 40 flats, each with 3 beds
    flats: Array.from({ length: 40 }, (_, f_idx) => ({
      id: `f-${f_idx + 1}`,
      flatNumber: 101 + f_idx, // Mock number
      beds: [
        { id: `b-${f_idx + 1}-1`, isBooked: Math.random() > 0.8 },
        { id: `b-${f_idx + 1}-2`, isBooked: Math.random() > 0.8 },
        { id: `b-${f_idx + 1}-3`, isBooked: Math.random() > 0.8 },
      ]
    }))
  }
];

const PGOwnerDashboard = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState(MOCK_PROPERTIES);
  const [selectedPropertyId, setSelectedPropertyId] = useState(1);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [newPropertyData, setNewPropertyData] = useState({ name: '', city: '', locality: '', flatsCount: 10, bedsPerFlat: 3 });

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  const handleAddProperty = (e) => {
    e.preventDefault();
    const newProperty = {
      id: properties.length + 1,
      name: newPropertyData.name,
      city: newPropertyData.city,
      locality: newPropertyData.locality,
      images: [flat1, flat2], // Fallback mock images
      flats: Array.from({ length: parseInt(newPropertyData.flatsCount) || 10 }, (_, f_idx) => ({
        id: `nf-${Date.now()}-${f_idx}`,
        flatNumber: 101 + f_idx,
        beds: Array.from({ length: parseInt(newPropertyData.bedsPerFlat) || 3 }, (_, b_idx) => ({
          id: `nb-${Date.now()}-${f_idx}-${b_idx}`,
          isBooked: false
        }))
      }))
    };
    setProperties([...properties, newProperty]);
    setSelectedPropertyId(newProperty.id);
    setIsAddingProperty(false);
    setNewPropertyData({ name: '', city: '', locality: '', flatsCount: 10, bedsPerFlat: 3 });
  };

  const toggleBedStatus = (flatId, bedId) => {
    setProperties(prev => prev.map(prop => {
      if (prop.id !== selectedPropertyId) return prop;
      
      const updatedFlats = prop.flats.map(flat => {
        if (flat.id !== flatId) return flat;
        const updatedBeds = flat.beds.map(bed => {
          if (bed.id !== bedId) return bed;
          return { ...bed, isBooked: !bed.isBooked };
        });
        return { ...flat, beds: updatedBeds };
      });
      
      return { ...prop, flats: updatedFlats };
    }));
  };

  const calculateStats = () => {
    if (!selectedProperty) return { total: 0, booked: 0, available: 0 };
    let total = 0, booked = 0;
    selectedProperty.flats.forEach(f => {
      f.beds.forEach(b => {
        total++;
        if (b.isBooked) booked++;
      });
    });
    return { total, booked, available: total - booked };
  };

  const stats = calculateStats();

  return (
    <div className="flex relative h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 md:w-80 bg-white border-r border-gray-100 flex flex-col shadow-sm z-10 flex-shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <Link to="/pg" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 tracking-tight block">
            PG Manager
          </Link>
          <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">OWNER</span>
        </div>
        
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Your Properties</h3>
          <div className="space-y-2">
            {properties.map(p => (
              <button 
                key={p.id}
                onClick={() => setSelectedPropertyId(p.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${selectedPropertyId === p.id ? 'bg-primary-50 text-primary-700 border border-primary-100 font-semibold' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                <div className="font-bold">{p.name}</div>
                <div className="text-xs opacity-70">{p.locality}, {p.city}</div>
              </button>
            ))}
            <button onClick={() => setIsAddingProperty(true)} className="w-full text-left px-4 py-3 rounded-xl border border-dashed border-gray-300 text-gray-500 font-medium hover:bg-gray-50 hover:text-primary-600 transition-colors flex items-center justify-center">
              + Add Property
            </button>
          </div>
        </div>
        
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Notifications</h3>
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-sm">
            <span className="font-bold text-amber-700 block mb-1">New Booking Request!</span>
            <span className="text-amber-600">Rahul V. wants a seat in Flat 105.</span>
            <button className="mt-2 text-xs font-bold bg-amber-200 text-amber-800 px-3 py-1.5 rounded-lg hover:bg-amber-300">View Details</button>
          </div>
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
          <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div>
                <h1 className="text-3xl font-extrabold text-dark-900 mb-2">{selectedProperty.name}</h1>
                <p className="text-gray-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {selectedProperty.locality}, {selectedProperty.city}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-xl font-bold text-dark-900">{stats.total}</div>
                  <div className="text-xs font-semibold text-gray-500 uppercase">Total Beds</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-xl border border-red-100">
                  <div className="text-xl font-bold text-red-600">{stats.booked}</div>
                  <div className="text-xs font-semibold text-red-500 uppercase">Booked</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="text-xl font-bold text-green-600">{stats.available}</div>
                  <div className="text-xs font-semibold text-green-600 uppercase">Available</div>
                </div>
              </div>
            </header>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-dark-900 mb-3">Property Images</h2>
              <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
                {selectedProperty.images.map((img, i) => (
                  <img key={i} src={img} alt="Property" className="w-48 h-32 object-cover rounded-xl shadow-sm border border-gray-200" />
                ))}
                <button className="w-48 h-32 flex-shrink-0 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                  <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  <span className="text-sm font-medium">Add Image</span>
                </button>
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-dark-900">Bed Allocation (RedBus Style)</h2>
              <div className="flex gap-4 text-sm font-medium">
                <span className="flex items-center"><div className="w-4 h-4 bg-green-500 rounded mr-2"></div> Available</span>
                <span className="flex items-center"><div className="w-4 h-4 bg-red-500 rounded mr-2"></div> Booked</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {selectedProperty.flats.map(flat => (
                <div key={flat.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-lg text-dark-900">Flat {flat.flatNumber}</h3>
                    <span className="text-xs font-bold text-gray-400">{flat.beds.length} Beds</span>
                  </div>
                  
                  {/* Bed Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {flat.beds.map((bed, idx) => (
                      <button
                        key={bed.id}
                        onClick={() => toggleBedStatus(flat.id, bed.id)}
                        className={`
                          relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all 
                          ${bed.isBooked 
                            ? 'bg-red-50 border-red-200 hover:border-red-400' 
                            : 'bg-green-50 border-green-200 hover:border-green-400 cursor-pointer'}
                        `}
                        title={bed.isBooked ? "Click to mark Available" : "Click to mark Booked"}
                      >
                        <svg className={`w-6 h-6 mb-1 ${bed.isBooked ? 'text-red-500' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg>
                        <span className={`text-xs font-bold ${bed.isBooked ? 'text-red-700' : 'text-green-700'}`}>
                          B{idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a property to manage.
          </div>
        )}
      </main>

      {/* Add Property Modal */}
      {isAddingProperty && (
        <div className="fixed inset-0 bg-dark-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-dark-900">Add New PG Property</h2>
              <button onClick={() => setIsAddingProperty(false)} className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-dark-900 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="add-prop-form" onSubmit={handleAddProperty} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Property Name</label>
                  <input required placeholder="e.g., Sunrise PG" value={newPropertyData.name} onChange={e => setNewPropertyData({...newPropertyData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                    <input required placeholder="e.g., Pune" value={newPropertyData.city} onChange={e => setNewPropertyData({...newPropertyData, city: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Locality</label>
                    <input required placeholder="e.g., Wakad" value={newPropertyData.locality} onChange={e => setNewPropertyData({...newPropertyData, locality: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Number of Flats</label>
                    <input type="number" min="1" required value={newPropertyData.flatsCount} onChange={e => setNewPropertyData({...newPropertyData, flatsCount: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Beds Per Flat</label>
                    <input type="number" min="1" max="10" required value={newPropertyData.bedsPerFlat} onChange={e => setNewPropertyData({...newPropertyData, bedsPerFlat: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Property Images</label>
                  <div className="w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span className="text-sm font-medium">Click or drag images here to upload</span>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex justify-end">
              <div className="flex space-x-3">
                <button type="button" onClick={() => setIsAddingProperty(false)} className="px-5 py-2.5 rounded-xl font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" form="add-prop-form" className="px-6 py-2.5 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 hover:shadow-glow transition-all">Create Property</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PGOwnerDashboard;
