import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePGOwnerAuth } from '../context/PGOwnerAuthContext';
import { pgPropertyAPI } from '../lib/api';
import BookingLogs from '../components/BookingLogs';
import ImageUpload from '../components/ImageUpload';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const PGOwnerDashboardNew = () => {
  const navigate = useNavigate();
  const { pgOwner, pgOwnerToken, logoutPGOwner } = usePGOwnerAuth();
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('properties'); // 'properties' or 'bookings'
  const [uploadedImages, setUploadedImages] = useState([]);
  const [ownerBookings, setOwnerBookings] = useState([]);
  
  const [propertyForm, setPropertyForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    location: '',
    totalBeds: '',
    pricePerBed: '',
    amenities: '',
    rules: '',
  });

  useEffect(() => {
    if (!pgOwner || !pgOwnerToken) {
      navigate('/pg/owner-login');
      return;
    }

    fetchProperties();
    fetchOwnerBookings();
  }, [pgOwner, pgOwnerToken, navigate]);

  const fetchOwnerBookings = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/pg-properties/bookings', {
        headers: { Authorization: `Bearer ${pgOwnerToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch owner bookings');
      const data = await res.json();
      // Normalize fields to ensure consistent types for comparisons
      const normalized = (data.bookings || []).map(b => ({
        ...b,
        propertyId: String(b.propertyId),
        bedNumber: Number(b.bedNumber),
        createdAt: b.createdAt ? new Date(b.createdAt).toString() : null,
      }));
      console.log('fetchOwnerBookings response:', normalized);
      setOwnerBookings(normalized);
    } catch (err) {
      console.error('Failed to load owner bookings', err);
      setOwnerBookings([]);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await pgPropertyAPI.getOwnerProperties(pgOwnerToken);
      setProperties(response.properties || []);
      if (response.properties && response.properties.length > 0) {
        setSelectedProperty(response.properties[0]);
      }
      setError('');
    } catch (err) {
      setError('Failed to fetch properties');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyFormChange = (e) => {
    const { name, value } = e.target;
    setPropertyForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    try {
      if (!propertyForm.name || !propertyForm.description || !propertyForm.address || 
          !propertyForm.city || !propertyForm.location || !propertyForm.totalBeds || !propertyForm.pricePerBed) {
        alert('Please fill all required fields');
        return;
      }

      const propertyData = {
        name: propertyForm.name,
        description: propertyForm.description,
        address: propertyForm.address,
        city: propertyForm.city,
        location: propertyForm.location,
        totalBeds: parseInt(propertyForm.totalBeds),
        pricePerBed: parseInt(propertyForm.pricePerBed),
        amenities: propertyForm.amenities.split(',').map(a => a.trim()).filter(Boolean),
        images: uploadedImages,
        rules: propertyForm.rules || null,
      };

      await pgPropertyAPI.createProperty(propertyData, pgOwnerToken);
      
      setPropertyForm({
        name: '',
        description: '',
        address: '',
        city: '',
        location: '',
        totalBeds: '',
        pricePerBed: '',
        amenities: '',
        rules: '',
      });
      setUploadedImages([]);
      setShowAddProperty(false);
      
      await fetchProperties();
      alert('Property added successfully!');
    } catch (err) {
      alert('Failed to add property: ' + err.message);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await pgPropertyAPI.deleteProperty(propertyId, pgOwnerToken);
        await fetchProperties();
        alert('Property deleted successfully!');
      } catch (err) {
        alert('Failed to delete property: ' + err.message);
      }
    }
  };

  const handleLogout = () => {
    logoutPGOwner();
    navigate('/pg/landing');
  };

  const getBedStatus = (index, property) => {
    // Determine real booking state for this bed: 'free' | 'pending' | 'confirmed'
    const bookingsForProperty = ownerBookings.filter(b => String(b.propertyId) === String(property._id));
    const confirmed = bookingsForProperty.find(b => b.status === 'confirmed' && Number(b.bedNumber) === index + 1);
    if (confirmed) return { state: 'confirmed', booking: confirmed };
    const pending = bookingsForProperty.find(b => b.status === 'pending' && Number(b.bedNumber) === index + 1);
    if (pending) return { state: 'pending', booking: pending };
    return { state: 'free', booking: null };
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <NavBar />
      
      <main className="flex-grow pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-dark-900">
                Welcome, {pgOwner?.name}!
              </h1>
              <p className="text-gray-600 mt-2">
                {pgOwner?.companyName} • {pgOwner?.location}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm font-medium">Total Properties</div>
              <div className="text-4xl font-bold text-primary-600 mt-2">{properties.length}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm font-medium">Total Beds</div>
              <div className="text-4xl font-bold text-primary-600 mt-2">
                {properties.reduce((sum, prop) => sum + prop.totalBeds, 0)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm font-medium">Available Beds</div>
              <div className="text-4xl font-bold text-primary-600 mt-2">
                {properties.reduce((sum, prop) => sum + prop.availableBeds, 0)}
              </div>
            </div>
          </div>

          {/* Add Property Button */}
          <button
            onClick={() => setShowAddProperty(!showAddProperty)}
            className="mb-8 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
          >
            {showAddProperty ? 'Cancel' : '+ Add New Property'}
          </button>

          {/* Add Property Form */}
          {showAddProperty && (
            <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-dark-900 mb-6">Add New Property</h2>
              
              <form onSubmit={handleAddProperty} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Property Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={propertyForm.name}
                      onChange={handlePropertyFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="E.g., Cozy PG for Boys"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={propertyForm.city}
                      onChange={handlePropertyFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="E.g., Bangalore"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Location/Area *</label>
                    <input
                      type="text"
                      name="location"
                      value={propertyForm.location}
                      onChange={handlePropertyFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="E.g., Koramangala"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={propertyForm.address}
                      onChange={handlePropertyFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Full address"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Total Beds *</label>
                    <input
                      type="number"
                      name="totalBeds"
                      value={propertyForm.totalBeds}
                      onChange={handlePropertyFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Number of beds"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Price Per Bed (Monthly) *</label>
                    <input
                      type="number"
                      name="pricePerBed"
                      value={propertyForm.pricePerBed}
                      onChange={handlePropertyFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Price in rupees"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={propertyForm.description}
                    onChange={handlePropertyFormChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Describe your property in detail"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Amenities (comma separated)</label>
                  <input
                    type="text"
                    name="amenities"
                    value={propertyForm.amenities}
                    onChange={handlePropertyFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="E.g., WiFi, AC, Laundry, Kitchen, etc."
                  />
                </div>

                <ImageUpload onImagesUploaded={setUploadedImages} />

                <div>
                  <label className="block text-gray-700 font-medium mb-2">House Rules</label>
                  <textarea
                    name="rules"
                    value={propertyForm.rules}
                    onChange={handlePropertyFormChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="E.g., No parties, No pets, Quiet hours 10pm-8am"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Add Property
                </button>
              </form>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-8 flex gap-4 border-b border-gray-300">
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-6 py-3 font-bold transition-colors ${
                activeTab === 'properties'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Properties
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-3 font-bold transition-colors ${
                activeTab === 'bookings'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📅 Booking Requests
            </button>
          </div>

          {activeTab === 'properties' && (
            <div>
              {/* Properties List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block text-gray-500">Loading properties...</div>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-gray-500 text-lg">No properties yet. Add your first property above!</div>
                </div>
              ) : (
                <div className="space-y-8">
                  {properties.map((property) => (
                    <div key={property._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                      {/* Property Header */}
                      <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-6 text-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-3xl font-bold mb-2">{property.name}</h2>
                            <p className="text-sm opacity-90">📍 {property.location}, {property.city}</p>
                            <p className="text-sm opacity-90">📍 {property.address}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-4xl font-bold">{property.totalBeds}</div>
                            <div className="text-sm opacity-90">Total Beds</div>
                          </div>
                        </div>
                      </div>
                      {/* DEBUG: show booking counts for this property */}
                      <div className="p-2 text-sm text-gray-600">
                        {(() => {
                          const count = ownerBookings.filter(b => String(b.propertyId) === String(property._id)).length;
                          return `Bookings for this property: ${count}`;
                        })()}
                      </div>

                      {/* Property Info */}
                      <div className="p-6 bg-gray-50 border-b">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <span className="text-gray-600 text-sm">Price per Bed</span>
                            <p className="text-2xl font-bold text-primary-600">₹{property.pricePerBed}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">Available Beds</span>
                            <p className="text-2xl font-bold text-green-600">{property.availableBeds}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">Booked Beds</span>
                            <p className="text-2xl font-bold text-orange-600">{property.totalBeds - property.availableBeds}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">Occupancy</span>
                            <p className="text-2xl font-bold text-blue-600">
                              {Math.round(((property.totalBeds - property.availableBeds) / property.totalBeds) * 100)}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Beds Grid */}
                      <div className="p-8">
                        <h3 className="text-xl font-bold text-dark-900 mb-6">Bed Availability</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {Array.from({ length: property.totalBeds }).map((_, index) => {
                            const { state, booking } = getBedStatus(index, property);

                            const handleBedClick = async () => {
                              if (state === 'free') return; // nothing to do

                              // Confirm pending booking
                              if (state === 'pending') {
                                if (!window.confirm(`Confirm booking for Bed ${index + 1}?`)) return;
                                try {
                                  const res = await fetch(`http://localhost:5001/api/pg-properties/bookings/${booking._id}/confirm`, {
                                    method: 'POST',
                                    headers: { Authorization: `Bearer ${pgOwnerToken}`, 'Content-Type': 'application/json' },
                                  });
                                  if (!res.ok) throw new Error('Failed to confirm');
                                  await fetchOwnerBookings();
                                  await fetchProperties();
                                  alert('Booking confirmed');
                                } catch (err) {
                                  alert('Error confirming booking: ' + err.message);
                                }
                                return;
                              }

                              // Unbook confirmed booking
                              if (state === 'confirmed') {
                                if (!window.confirm('Mark this bed as unbooked (free it)?')) return;
                                try {
                                  const res = await fetch(`http://localhost:5001/api/pg-properties/bookings/${booking._id}/unbook`, {
                                    method: 'POST',
                                    headers: { Authorization: `Bearer ${pgOwnerToken}`, 'Content-Type': 'application/json' },
                                  });
                                  if (!res.ok) throw new Error('Failed to unbook');
                                  await fetchOwnerBookings();
                                  await fetchProperties();
                                  alert('Bed freed successfully');
                                } catch (err) {
                                  alert('Error freeing bed: ' + err.message);
                                }
                                return;
                              }
                            };

                            const classNameForState = state === 'confirmed'
                              ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg'
                              : state === 'pending'
                                ? 'bg-gradient-to-br from-yellow-300 to-orange-400 text-white shadow-md'
                                : 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md hover:shadow-xl';

                            return (
                              <div
                                key={index}
                                onClick={handleBedClick}
                                className={`relative group cursor-pointer h-32 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-300 transform hover:scale-105 ${classNameForState}`}
                              >
                                <div className="text-center">
                                  <div className="text-3xl">🛏️</div>
                                  <div className="text-sm mt-1">Bed {index + 1}</div>
                                </div>

                                {/* Hover Tooltip showing tenant details when booked/pending */}
                                {state !== 'free' && booking && (
                                  <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs p-3 rounded-lg whitespace-nowrap z-10 shadow-lg">
                                    <div className="font-bold mb-1">{state === 'confirmed' ? 'Confirmed' : 'Pending'}</div>
                                    <div className="text-gray-300">{booking.tenantName}</div>
                                    <div className="text-gray-300">{booking.tenantEmail}</div>
                                    <div className="text-gray-300">{booking.tenantPhone}</div>
                                    <div className="text-gray-400 text-xs mt-2">Requested: {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : ''}</div>
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Description & Amenities */}
                      <div className="p-6 border-t">
                        <div className="mb-4">
                          <h4 className="font-bold text-dark-900 mb-2">Description</h4>
                          <p className="text-gray-600 text-sm">{property.description}</p>
                        </div>
                        {property.amenities && property.amenities.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-bold text-dark-900 mb-2">Amenities</h4>
                            <div className="flex flex-wrap gap-2">
                              {property.amenities.map((amenity, idx) => (
                                <span key={idx} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="p-6 border-t bg-gray-50 flex justify-between">
                        <button
                          onClick={() => handleDeleteProperty(property._id)}
                          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                        >
                          Delete Property
                        </button>
                        <button
                          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
                        >
                          Edit Property
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <BookingLogs pgOwnerToken={pgOwnerToken} onRefresh={async () => { await fetchOwnerBookings(); await fetchProperties(); }} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PGOwnerDashboardNew;
