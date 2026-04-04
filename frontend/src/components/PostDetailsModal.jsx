import React, { useState } from 'react';

const PostDetailsModal = ({ post, onClose, onGetNumber }) => {
  const [activeImage, setActiveImage] = useState(0);

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-dark-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-y-auto custom-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors shadow-md"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className="flex flex-col lg:flex-row">
          {/* Image Gallery */}
          <div className="w-full lg:w-1/2 p-6 bg-gray-50 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200">
            <div className="w-full aspect-square rounded-xl overflow-hidden mb-4 shadow-md">
              <img src={post.images[activeImage]} alt="Flat View" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {post.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === idx 
                      ? 'border-blue-600 shadow-md scale-105' 
                      : 'border-gray-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-lg">Featured</span>
              {post.tenantType && (
                <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                  post.tenantType === 'Girls' || post.tenantType === 'Boys' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {post.tenantType === 'Anyone' ? 'Any Tenant' : `Only ${post.tenantType}`}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-1">{post.society}</h2>
            
            {/* Location */}
            <p className="text-gray-600 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              {post.locality ? `${post.locality}, ${post.city}` : post.city}
            </p>

            {/* Rent Box */}
            <div className="mb-8 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-600 font-semibold mb-1 uppercase">Monthly Rent</p>
              <p className="text-3xl font-bold text-blue-700">₹{post.rent} <span className="text-lg font-normal">/month</span></p>
            </div>

            {/* Description */}
            {post.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">{post.description}</p>
              </div>
            )}

            {/* Quick Facts */}
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
            <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-gray-200">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 font-semibold mb-1">Area</p>
                <p className="text-lg font-bold text-gray-900">{post.area} sq.ft</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 font-semibold mb-1">Deposit</p>
                <p className="text-lg font-bold text-gray-900">₹{post.deposit}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 font-semibold mb-1">Smoking</p>
                <p className="text-lg font-bold text-gray-900">{post.smokerAllowed ? '✔ Yes' : '✘ No'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 font-semibold mb-1">Drinking</p>
                <p className="text-lg font-bold text-gray-900">{post.drinkerAllowed ? '✔ Yes' : '✘ No'}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 font-semibold mb-2">Posted By</p>
              <div className="flex items-center justify-between">
                <p className="text-gray-900 font-bold">{post.postedBy}</p>
                {post.auraScore && (
                  <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    {post.auraScore} Score
                  </span>
                )}
              </div>
            </div>

            {/* Contact Number Display */}
            {post.contactNumber && (
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <p className="text-xs text-green-600 font-bold uppercase mb-1">✓ Contact Approved</p>
                <p className="text-2xl font-bold text-green-700">{post.contactNumber}</p>
              </div>
            )}

            {/* Amenities */}
            {Array.isArray(post.amenities) && post.amenities.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {post.amenities.map((amenity, index) => (
                    <span
                      key={`${amenity}-${index}`}
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto pt-6 border-t border-gray-200 flex gap-3">
              {!post.contactNumber && onGetNumber && (
                <button 
                  onClick={() => onGetNumber(post)}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  title="Request contact number from property owner"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948.684l1.498 4.493a1 1 0 00.502.609l2.01 1.042a1 1 0 00.897 0l2.01-1.042a1 1 0 00.502-.609l1.498-4.493a1 1 0 00-.948-.684H17a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"></path>
                  </svg>
                  Get Number
                </button>
              )}
              <button className="w-12 h-12 flex items-center justify-center rounded-lg border-2 border-gray-300 text-gray-500 hover:text-red-600 hover:border-red-500 hover:bg-red-50 transition-all font-bold text-xl">
                ♡
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailsModal;
