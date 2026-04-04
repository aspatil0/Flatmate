import React from 'react';

const PostCard = ({
  post,
  onInterested,
  onBook,
  onToggleFavorite,
  isFavorite = false,
  canManage = false,
  onEdit,
  onDelete,
  onChat,
  onGetNumber,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Image Section */}
      <div className="relative h-44 w-full bg-gray-100">
        <img 
          src={post.images[0]} 
          alt={post.society} 
          className="w-full h-full object-cover" 
        />
        
        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(post)}
            className={`absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all duration-200 ${
              isFavorite
                ? 'bg-red-500 border-red-600 text-white shadow-lg'
                : 'bg-white/95 border-white text-gray-400 hover:text-red-500 hover:bg-white'
            }`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>
        )}

        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
          ₹{post.rent}/mo
        </div>

        {/* Edit/Delete Buttons for Owner */}
        {canManage && (
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              type="button"
              onClick={() => onEdit && onEdit(post)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete && onDelete(post)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{post.society}</h3>
        
        {/* Location */}
        <p className="text-sm text-gray-500 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          {post.locality ? `${post.locality}, ${post.city}` : post.city}
        </p>

        {/* Key Details */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <span className="font-medium">{post.area}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
            </svg>
            <span className="font-medium text-gray-700">{post.postedBy}</span>
          </div>
        </div>

        {/* Contact Number - Highlighted */}
        {post.contactNumber && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-600 font-semibold uppercase mb-1">Contact</p>
            <p className="text-lg font-bold text-green-700">{post.contactNumber}</p>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.roomType && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
              {post.roomType}
            </span>
          )}
          {post.tenantType && (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              post.tenantType === 'Girls' || post.tenantType === 'Boys' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {post.tenantType === 'Anyone' ? 'Any' : post.tenantType}
            </span>
          )}
          {post.smokerAllowed ? (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Smoking</span>
          ) : (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold line-through opacity-60">Smoking</span>
          )}
        </div>

        {/* Amenities */}
        {Array.isArray(post.amenities) && post.amenities.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Amenities</p>
            <div className="flex flex-wrap gap-1.5">
              {post.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={`${amenity}-${index}`}
                  className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium"
                >
                  {amenity}
                </span>
              ))}
              {post.amenities.length > 3 && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                  +{post.amenities.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            {/* Primary Buttons */}
            <button 
              onClick={() => onBook && onBook(post)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Book
            </button>

            {!canManage && onChat && (
              <button
                onClick={() => onChat(post)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                Chat
              </button>
            )}

            {!canManage && !post.contactNumber && onGetNumber && (
              <button
                onClick={() => onGetNumber(post)}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1"
                title="Request contact number from property owner"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948.684l1.498 4.493a1 1 0 00.502.609l2.01 1.042a1 1 0 00.897 0l2.01-1.042a1 1 0 00.502-.609l1.498-4.493a1 1 0 00-.948-.684H17a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"></path>
                </svg>
                Number
              </button>
            )}

            {onInterested && (
              <button 
                onClick={() => onInterested(post)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h-2m2 0h2m-2 0v2m0-2v-2m0 2H8m6 0h2m-2 0h2m-2 0v2m0-2v-2"></path>
                </svg>
                Mark
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
