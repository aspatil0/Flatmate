import React from 'react';

const PostCard = ({ post, onInterested }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-soft transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="relative h-48 w-full">
        <img src={post.images[0]} alt={post.society} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary-600">
          ₹{post.rent}/mo
        </div>
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-dark-900 mb-1 truncate">{post.society}</h3>
        <p className="text-sm text-gray-500 mb-2 truncate">{post.locality ? `${post.locality}, ${post.city}` : post.city}</p>
        
        <div className="flex items-center text-gray-500 text-sm mb-4 space-x-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            {post.area} sqft
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
            <span className="mr-2">{post.postedBy}</span>
            {post.auraScore && (
              <span className="flex items-center text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                {post.auraScore}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs mb-6">
          {post.tenantType && (
            <span className={`px-2 py-1 rounded-full border font-medium ${
              post.tenantType === 'Girls' || post.tenantType === 'Boys' 
                ? 'bg-red-50 text-red-700 border-red-200' 
                : 'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
              {post.tenantType === 'Anyone' ? 'Any Tenant' : `Only ${post.tenantType}`}
            </span>
          )}
          {post.smokerAllowed ? (
            <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-100">Smoking ✔</span>
          ) : (
            <span className="bg-red-50 text-red-700 px-2 py-1 rounded-full border border-red-100">Smoking ✘</span>
          )}
          {post.drinkerAllowed ? (
            <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-100">Drinking ✔</span>
          ) : (
            <span className="bg-red-50 text-red-700 px-2 py-1 rounded-full border border-red-100">Drinking ✘</span>
          )}
        </div>

        <div className="mt-auto">
          <button 
            onClick={() => onInterested(post)}
            className="w-full bg-primary-50 text-primary-600 font-semibold py-2.5 rounded-xl hover:bg-primary-600 hover:text-white transition-colors duration-300"
          >
            Interested
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
