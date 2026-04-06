import React, { useState, useEffect } from 'react';

const BookingLogs = ({ pgOwnerToken, onRefresh }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, confirmed

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/pg-properties/bookings', {
        headers: {
          'Authorization': `Bearer ${pgOwnerToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      setBookings(data.bookings || []);
      setError('');
    } catch (err) {
      setError('Failed to load bookings: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/pg-properties/bookings/${bookingId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pgOwnerToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to confirm booking');
      
      // Update local state
      setBookings(bookings.map(b => 
        b._id === bookingId ? { ...b, status: 'confirmed' } : b
      ));
      // notify parent to refresh its booking/property lists
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this booking?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/pg-properties/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pgOwnerToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to reject booking');
      
      setBookings(bookings.filter(b => b._id !== bookingId));
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const filteredBookings = bookings.filter(b => 
    filter === 'all' ? true : b.status === filter
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Filter Buttons */}
      <div className="mb-6 flex gap-3">
        {['all', 'pending', 'confirmed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors capitalize ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status} ({bookings.filter(b => status === 'all' ? true : b.status === status).length})
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-500 text-lg">No bookings found</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden border-l-4"
                 style={{borderColor: booking.status === 'confirmed' ? '#10b981' : '#f59e0b'}}>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                  {/* Property Info */}
                  <div>
                    <div className="text-gray-600 text-sm font-medium">Property</div>
                    <div className="font-bold text-dark-900">{booking.propertyName}</div>
                    <div className="text-gray-500 text-sm">{booking.city}</div>
                  </div>

                  {/* Tenant Info */}
                  <div>
                    <div className="text-gray-600 text-sm font-medium">👤 Tenant</div>
                    <div className="font-bold text-dark-900">{booking.tenantName}</div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <div className="text-gray-600 text-sm font-medium">📧 Email</div>
                    <a href={`mailto:${booking.tenantEmail}`} className="text-primary-600 hover:text-primary-700 break-all">
                      {booking.tenantEmail}
                    </a>
                  </div>

                  {/* Phone Info */}
                  <div>
                    <div className="text-gray-600 text-sm font-medium">📱 Phone</div>
                    <a href={`tel:${booking.tenantPhone}`} className="text-primary-600 hover:text-primary-700 font-semibold">
                      {booking.tenantPhone}
                    </a>
                  </div>

                  {/* Bed Number */}
                  <div>
                    <div className="text-gray-600 text-sm font-medium">🛏️ Bed</div>
                    <div className="font-bold text-lg text-primary-600">Bed {booking.bedNumber}</div>
                  </div>
                </div>

                {/* Booking Date */}
                <div className="text-sm text-gray-500 mb-4 pb-4 border-b">
                  Request received: {new Date(booking.createdAt).toLocaleString()}
                </div>

                {/* Status Badge & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleRejectBooking(booking._id)}
                          className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleConfirmBooking(booking._id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                        >
                          ✓ Confirm Booking
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <span className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium">
                        ✓ Confirmed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingLogs;
