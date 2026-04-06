import React, { useState } from 'react';
import { pgPropertyAPI } from '../lib/api';

const BedSelectionModal = ({ property, onClose, onBookingSuccess }) => {
  const [selectedBed, setSelectedBed] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    tenantName: '',
    tenantEmail: '',
    tenantPhone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBedSelect = (bedNumber) => {
    setSelectedBed(bedNumber);
    setShowBookingForm(true);
    setError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!bookingForm.tenantName || !bookingForm.tenantEmail || !bookingForm.tenantPhone) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const bookingData = {
        propertyId: property._id,
        bedNumber: selectedBed,
        tenantName: bookingForm.tenantName,
        tenantEmail: bookingForm.tenantEmail,
        tenantPhone: bookingForm.tenantPhone,
      };

      // Call booking API
      const response = await fetch('http://localhost:5001/api/pg-properties/book-bed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Booking failed');
      }

      setError('');
      onBookingSuccess();
    } catch (err) {
      setError(err.message);
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBookedBeds = () => {
    // This would come from the property data in real implementation
    return Math.floor(property.totalBeds - property.availableBeds);
  };

  const bookedBeds = getBookedBeds();
  const availableBeds = property.totalBeds - bookedBeds;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-purple-600 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Select a Bed</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {!showBookingForm ? (
            <div>
              <div className="mb-6 grid grid-cols-2 gap-4 text-center">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{availableBeds}</div>
                  <div className="text-gray-600 text-sm">Available Beds</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{bookedBeds}</div>
                  <div className="text-gray-600 text-sm">Booked Beds</div>
                </div>
              </div>

              <p className="text-gray-600 mb-4 text-center font-medium">
                🛏️ Click on a bed to book it
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {Array.from({ length: property.totalBeds }).map((_, index) => {
                  const bedNumber = index + 1;
                  const isBooked = index < bookedBeds;
                  
                  return (
                    <button
                      key={bedNumber}
                      onClick={() => !isBooked && handleBedSelect(bedNumber)}
                      disabled={isBooked}
                      className={`h-20 rounded-lg flex items-center justify-center font-bold text-lg transition-all ${
                        isBooked
                          ? 'bg-gray-200 text-gray-600 cursor-not-allowed opacity-50'
                          : selectedBed === bedNumber
                          ? 'bg-primary-600 text-white scale-110 shadow-lg'
                          : 'bg-green-100 text-green-700 hover:bg-green-200 hover:scale-105 cursor-pointer'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl">🛏️</div>
                        <div className="text-xs mt-1">{bedNumber}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedBed && (
                <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <p className="text-primary-700 font-semibold">
                    ✓ Bed {selectedBed} selected! Click Next to proceed with booking details.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-primary-700 font-semibold">
                  Booking for: <span className="text-lg">Bed {selectedBed}</span>
                </p>
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="tenantName"
                    value={bookingForm.tenantName}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="tenantEmail"
                    value={bookingForm.tenantEmail}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Mobile Number *</label>
                  <input
                    type="tel"
                    name="tenantPhone"
                    value={bookingForm.tenantPhone}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="+91 9999999999"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors disabled:bg-gray-400"
                  >
                    {loading ? '🔄 Confirming...' : '✓ Confirm Booking'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BedSelectionModal;
