import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pgPropertyAPI } from '../lib/api';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const PGBrowse = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    search: '',
  });

  // Initial fetch on mount
  useEffect(() => {
    fetchProperties();
  }, []);

  // Fetch when filters change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.city !== '' || filters.search !== '') {
        fetchProperties();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      console.log('🔍 PGBrowse: Fetching properties with filters:', filters);
      const response = await pgPropertyAPI.getAllProperties(filters);
      console.log('✅ PGBrowse: API Response:', response);
      console.log('📊 PGBrowse: Response properties array:', response.properties);
      console.log('📊 PGBrowse: Response properties length:', response.properties?.length);
      
      const propsToSet = response.properties || [];
      console.log('📝 PGBrowse: Setting state with', propsToSet.length, 'properties');
      setProperties(propsToSet);
      setError('');
    } catch (err) {
      console.error('❌ PGBrowse: Error fetching properties:', err);
      console.error('❌ PGBrowse: Error message:', err.message);
      setError('Failed to fetch properties: ' + err.message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePropertyClick = (propertyId) => {
    navigate(`/pg/property/${propertyId}`);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <NavBar />
      
      <main className="flex-grow pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-dark-900 mb-2">
              Find Your Perfect PG
            </h1>
            <p className="text-gray-600">
              Browse and book available PG accommodations in your preferred location
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-lg font-bold text-dark-900 mb-4">Search & Filter</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="E.g., Bangalore"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">Search</label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Search by location, area, or amenities..."
                />
              </div>
            </div>
          </div>

          {/* Properties List */}
          <div>
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
                <div className="text-gray-500 text-lg">No properties found. Try adjusting your filters.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div 
                    key={property._id} 
                    onClick={() => handlePropertyClick(property._id)}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    {/* Image Section */}
                    <div className="bg-gradient-to-r from-primary-600 to-purple-600 h-40 flex items-center justify-center overflow-hidden">
                      {property.images && property.images.length > 0 ? (
                        <img 
                          src={property.images[0]} 
                          alt={property.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-white text-center">
                          <div className="text-4xl">🏢</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-dark-900 mb-2">{property.name}</h3>
                      <p className="text-gray-600 text-sm mb-1">📍 {property.location}</p>
                      <p className="text-gray-600 text-sm mb-4">{property.city}</p>
                      
                      <div className="space-y-2 mb-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Price/Bed:</span>
                          <span className="font-bold text-primary-600">₹{property.pricePerBed}/month</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Beds:</span>
                          <span className="font-bold">{property.totalBeds}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Available:</span>
                          <span className={`font-bold ${property.availableBeds > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {property.availableBeds} beds
                          </span>
                        </div>
                      </div>

                      {property.amenities && property.amenities.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-700 font-medium mb-2">Amenities:</p>
                          <div className="flex flex-wrap gap-2">
                            {property.amenities.slice(0, 3).map((amenity, idx) => (
                              <span key={idx} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                                {amenity}
                              </span>
                            ))}
                            {property.amenities.length > 3 && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                +{property.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {property.owner && (
                        <div className="pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Owner:</span> {property.owner.companyName || property.owner.name}
                          </p>
                        </div>
                      )}

                      <button
                        className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PGBrowse;
