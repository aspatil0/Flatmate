import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pgPropertyAPI } from '../lib/api';
import BedSelectionModal from '../components/BedSelectionModal';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const PGPropertyDetail = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBedSelection, setShowBedSelection] = useState(false);

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await pgPropertyAPI.getPropertyDetails(propertyId);
      setProperty(response.property);
      setError('');
    } catch (err) {
      console.error('Error fetching property:', err);
      setError('Failed to load property details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (property.availableBeds === 0) {
      setError('No beds available for booking');
      return;
    }
    setShowBedSelection(true);
  };

  const handleBookingSuccess = () => {
    setShowBedSelection(false);
    alert('✓ Booking request submitted! The owner will confirm your booking shortly.');
    navigate('/pg/browse');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <NavBar />
        <div className="flex-grow flex items-center justify-center pt-20">
          <div className="text-gray-500 text-lg">Loading property details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <NavBar />
        <div className="flex-grow flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">{error || 'Property not found'}</div>
            <button
              onClick={() => navigate('/pg/browse')}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              Back to Browse
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <NavBar />
      
      <main className="flex-grow pt-20 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/pg/browse')}
            className="mb-6 text-primary-600 hover:text-primary-700 flex items-center gap-2"
          >
            ← Back to Browse
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Images Section */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-primary-600 to-purple-600 h-96 flex items-center justify-center">
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
                      <div className="text-6xl mb-4">🏢</div>
                      <div>No images available</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Property Info */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h1 className="text-4xl font-bold text-dark-900 mb-2">{property.name}</h1>
                <p className="text-gray-600 text-lg mb-4">
                  📍 {property.location}, {property.city}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">₹{property.pricePerBed}</div>
                    <div className="text-gray-600 text-sm">/month per bed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{property.totalBeds}</div>
                    <div className="text-gray-600 text-sm">Total Beds</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${property.availableBeds > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {property.availableBeds}
                    </div>
                    <div className="text-gray-600 text-sm">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round((property.availableBeds / property.totalBeds) * 100)}%
                    </div>
                    <div className="text-gray-600 text-sm">Available</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-dark-900 mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-dark-900 mb-3">Address</h2>
                  <p className="text-gray-700">{property.address}</p>
                </div>

                {property.amenities && property.amenities.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-dark-900 mb-3">Amenities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {property.amenities.map((amenity, idx) => (
                        <div key={idx} className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg flex items-center border border-primary-300">
                          <span className="text-lg mr-2">✓</span>
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {property.rules && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-dark-900 mb-3">House Rules</h2>
                    <p className="text-gray-700 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      {property.rules}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Owner Card */}
              {property.owner && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                  <h3 className="text-xl font-bold text-dark-900 mb-4">Owner Details</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600">Company/Name</div>
                      <div className="font-semibold text-dark-900">{property.owner.companyName || property.owner.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Contact Person</div>
                      <div className="font-semibold text-dark-900">{property.owner.name}</div>
                    </div>
                    {property.owner.email && (
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <a href={`mailto:${property.owner.email}`} className="font-semibold text-primary-600 hover:text-primary-700">
                          {property.owner.email}
                        </a>
                      </div>
                    )}
                    {property.owner.phone && (
                      <div>
                        <div className="text-sm text-gray-600">Phone</div>
                        <a href={`tel:${property.owner.phone}`} className="font-semibold text-primary-600 hover:text-primary-700">
                          {property.owner.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Booking Status */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-dark-900 mb-4">Availability Status</h3>
                <div className="space-y-3">
                  {property.availableBeds > 0 ? (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="text-green-700 font-semibold">🟢 Available</div>
                      <div className="text-sm text-green-600 mt-1">
                        {property.availableBeds} bed{property.availableBeds !== 1 ? 's' : ''} available
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <div className="text-red-700 font-semibold">🔴 Not Available</div>
                      <div className="text-sm text-red-600 mt-1">All beds are booked</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Button */}
              <button
                onClick={handleBookNow}
                disabled={property.availableBeds === 0}
                className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
                  property.availableBeds > 0
                    ? 'bg-primary-600 hover:bg-primary-700 cursor-pointer'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {property.availableBeds > 0 ? 'Book Now' : 'Not Available'}
              </button>

              {/* Share Button */}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: property.name,
                      text: `Check out ${property.name} - ₹${property.pricePerBed}/month`,
                      url: window.location.href,
                    });
                  } else {
                    alert('Share link: ' + window.location.href);
                  }
                }}
                className="w-full mt-3 py-2 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 rounded-lg font-semibold transition-colors"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </main>

      {showBedSelection && (
        <BedSelectionModal
          property={property}
          onClose={() => setShowBedSelection(false)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      <Footer />
    </div>
  );
};

export default PGPropertyDetail;
