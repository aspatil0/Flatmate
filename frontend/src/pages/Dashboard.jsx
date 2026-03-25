import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import PostDetailsModal from '../components/PostDetailsModal';
import AddPostModal from '../components/AddPostModal';

// Images
import flat1 from '../assets/flat1.png';
import flat2 from '../assets/flat2.png';

const MOCK_POSTS = [
  {
    id: 1, society: 'DLF Magnolias', city: 'Gurugram', locality: 'Sector 42', rent: 22000, totalRent: 66000, deposit: 45000,
    area: 1400, images: [flat1, flat2, flat1, flat2], smokerAllowed: true, drinkerAllowed: true, tenantType: 'Anyone', postedBy: 'Alex K.'
  },
  {
    id: 2, society: 'Ireo Skyon', city: 'Gurugram', locality: 'Sector 60', rent: 18000, totalRent: 36000, deposit: 30000,
    area: 1050, images: [flat2, flat1, flat2, flat1], smokerAllowed: false, drinkerAllowed: true, tenantType: 'Girls', postedBy: 'Sarah M.'
  },
  {
    id: 3, society: 'M3M Golf Estate', city: 'Gurugram', locality: 'Sector 65', rent: 25000, totalRent: 75000, deposit: 50000,
    area: 1800, images: [flat1, flat2], smokerAllowed: false, drinkerAllowed: false, tenantType: 'Boys', postedBy: 'Rahul V.'
  },
  {
    id: 4, society: 'Amanora Park Town', city: 'Pune', locality: 'Hadapsar', rent: 15000, totalRent: 45000, deposit: 40000,
    area: 1200, images: [flat2, flat1], smokerAllowed: false, drinkerAllowed: false, tenantType: 'Girls', postedBy: 'Neha S.'
  },
  {
    id: 5, society: 'Godrej Infinity', city: 'Pune', locality: 'Keshav Nagar', rent: 16000, totalRent: 48000, deposit: 35000,
    area: 1100, images: [flat1, flat2], smokerAllowed: true, drinkerAllowed: true, tenantType: 'Anyone', postedBy: 'Amit P.'
  },
  {
    id: 6, society: 'Blue Ridge', city: 'Pune', locality: 'Hinjewadi', rent: 14000, totalRent: 42000, deposit: 30000,
    area: 1050, images: [flat2, flat1], smokerAllowed: true, drinkerAllowed: false, tenantType: 'Boys', postedBy: 'Rohan D.'
  },
  {
    id: 7, society: 'Kolte Patil Life Republic', city: 'Pune', locality: 'Hinjewadi', rent: 13000, totalRent: 39000, deposit: 25000,
    area: 950, images: [flat1, flat2], smokerAllowed: false, drinkerAllowed: true, tenantType: 'Girls', postedBy: 'Priya K.'
  },
  {
    id: 8, society: 'Pristine Prolife', city: 'Pune', locality: 'Wakad', rent: 17000, totalRent: 51000, deposit: 40000,
    area: 1250, images: [flat2, flat1], smokerAllowed: false, drinkerAllowed: false, tenantType: 'Anyone', postedBy: 'Suman T.'
  },
  {
    id: 9, society: 'Majestique Rhythm', city: 'Pune', locality: 'Yewalewadi', rent: 11000, totalRent: 33000, deposit: 20000,
    area: 850, images: [flat1, flat2], smokerAllowed: true, drinkerAllowed: true, tenantType: 'Boys', postedBy: 'Karan J.'
  },
  {
    id: 10, society: 'Kumar Piccadilly', city: 'Pune', locality: 'Katraj', rent: 12000, totalRent: 36000, deposit: 25000,
    area: 900, images: [flat2, flat1], smokerAllowed: false, drinkerAllowed: false, tenantType: 'Girls', postedBy: 'Aditi M.'
  },
  {
    id: 11, society: 'Ganga Ishanya', city: 'Pune', locality: 'Katraj', rent: 16000, totalRent: 48000, deposit: 35000,
    area: 1150, images: [flat1, flat2], smokerAllowed: true, drinkerAllowed: true, tenantType: 'Anyone', postedBy: 'Siddharth R.'
  },
  {
    id: 12, society: 'Lodha Belmondo', city: 'Pune', locality: 'Gahunje', rent: 20000, totalRent: 60000, deposit: 50000,
    area: 1500, images: [flat2, flat1], smokerAllowed: false, drinkerAllowed: true, tenantType: 'Boys', postedBy: 'Vikram B.'
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'favorites'
  const [posts, setPosts] = useState(MOCK_POSTS);
  
  // Modals
  const [selectedPost, setSelectedPost] = useState(null);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = posts.filter(post => {
    const query = searchQuery.toLowerCase();
    const cityMatch = post.city ? post.city.toLowerCase().includes(query) : false;
    const localityMatch = post.locality ? post.locality.toLowerCase().includes(query) : false;
    const societyMatch = post.society ? post.society.toLowerCase().includes(query) : false;
    return cityMatch || localityMatch || societyMatch;
  });

  const handleLogout = () => navigate('/');

  const handleAddPost = (newPostData) => {
    // mock add functionality
    const newPost = {
      id: posts.length + 1,
      ...newPostData,
      images: [flat1, flat2], // fallback mock images
      postedBy: 'You'
    };
    setPosts([newPost, ...posts]);
    setIsAddingPost(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 md:w-80 bg-white border-r border-gray-100 flex flex-col shadow-sm z-10 flex-shrink-0">
        <div className="p-6 border-b border-gray-100">
          <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 tracking-tight">
            Flatmate
          </Link>
        </div>
        
        {/* User Profile Summary */}
        <div className="p-6 border-b border-gray-100 flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-white">
            AD
          </div>
          <div className="overflow-hidden">
            <h3 className="font-bold text-dark-900 truncate">Aditya Doe</h3>
            <p className="text-xs text-gray-500 truncate">User ID: #FM-8924</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'feed' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span>Flat Feed</span>
          </button>
          <button 
            onClick={() => setActiveTab('favorites')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'favorites' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            <span>My Favorites</span>
          </button>

          <div className="pt-8 pb-2">
            <button 
              onClick={() => setIsAddingPost(true)}
              className="w-full bg-dark-900 text-white font-medium py-3 rounded-xl shadow-soft hover:shadow-glow hover:bg-primary-600 transition-all flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Add New Post
            </button>
          </div>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 p-6 sm:p-10 relative">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dark-900 mb-2">
              {activeTab === 'feed' ? 'Discover Flats' : 'Your Favorites'}
            </h1>
            <p className="text-gray-500">
              {activeTab === 'feed' ? 'Showing the latest premium flat listings available.' : 'Flats you have marked as interested.'}
            </p>
          </div>
          {activeTab === 'feed' && (
            <div className="w-full md:w-auto relative">
              <input 
                type="text" 
                placeholder="Search city, area, keyword..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          )}
        </header>

        {activeTab === 'feed' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onInterested={(p) => setSelectedPost(p)} 
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500">
                <p className="text-lg font-medium text-dark-600">No flats found matching your search.</p>
                <p className="text-sm">Try adjusting your keywords.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-24 h-24 bg-red-50 text-red-300 rounded-full flex items-center justify-center mb-6">
               <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-dark-900 mb-2">No Favorites Yet</h3>
            <p className="text-gray-500 max-w-sm">When you express interest in flats, they will appear here so you can easily find them later.</p>
            <button onClick={() => setActiveTab('feed')} className="mt-8 btn-outline px-6 py-2">Return to Feed</button>
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedPost && (
        <PostDetailsModal 
          post={selectedPost} 
          onClose={() => setSelectedPost(null)} 
        />
      )}

      {isAddingPost && (
        <AddPostModal 
          onClose={() => setIsAddingPost(false)} 
          onAdd={handleAddPost} 
        />
      )}

    </div>
  );
};

export default Dashboard;
