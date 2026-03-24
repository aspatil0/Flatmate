import React, { useState } from 'react';

const PostDetailsModal = ({ post, onClose }) => {
  const [activeImage, setActiveImage] = useState(0);

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-dark-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-y-auto custom-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-dark-900 hover:bg-gray-100 transition-colors shadow-sm"
        >
          ✕
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image Gallery */}
          <div className="w-full md:w-1/2 p-6 bg-gray-50 flex flex-col">
            <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 shadow-sm">
              <img src={post.images[activeImage]} alt="Flat View" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {post.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary-600 shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="w-full md:w-1/2 p-8 md:px-10 flex flex-col">
            <div className="mb-2">
              <span className="bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">New Listing</span>
            </div>
            <h2 className="text-3xl font-bold text-dark-900 mb-2">{post.society}</h2>
            <p className="text-gray-500 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Sector 42, DLF Phase 5
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Your Rent</p>
                <p className="text-2xl font-bold text-primary-600">₹{post.rent}<span className="text-sm font-normal text-gray-500">/mo</span></p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Total Rent</p>
                <p className="text-2xl font-bold text-dark-900">₹{post.totalRent}<span className="text-sm font-normal text-gray-500">/mo</span></p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-dark-900 mb-4">Quick Facts</h3>
            <ul className="space-y-3 mb-8">
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Area</span>
                <span className="font-medium">{post.area} sq.ft</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Deposit</span>
                <span className="font-medium">₹{post.deposit}</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Smoking Allowed</span>
                <span className="font-medium">{post.smokerAllowed ? 'Yes' : 'No'}</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Drinking Allowed</span>
                <span className="font-medium">{post.drinkerAllowed ? 'Yes' : 'No'}</span>
              </li>
            </ul>

            <div className="mt-auto flex gap-4">
              <button className="flex-1 btn-primary py-4">
                Chat with poster
              </button>
              <button className="w-14 h-14 flex items-center justify-center rounded-xl border-2 border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-500 hover:bg-red-50 transition-all">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailsModal;
