import React, { useState } from 'react';
import ImageUpload from './ImageUpload.jsx';

const today = new Date().toISOString().split('T')[0];

const AddPostModal = ({ onClose, onAdd, initialData = null, submitLabel = 'Publish Listing' }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || initialData?.society || '',
    description: initialData?.description || '',
    location: initialData?.location || [initialData?.city, initialData?.locality].filter(Boolean).join(', '),
    rent: initialData?.rent || '',
    contactNumber: initialData?.contactNumber || '',
    deposit: initialData?.deposit || '',
    roomType: initialData?.roomType || '1BHK',
    bhkSize: initialData?.bhkSize || initialData?.area || '',
    availableFrom: initialData?.availableFrom ? String(initialData.availableFrom).split('T')[0] : '',
    tenantType: initialData?.tenantType || 'Anyone',
    smokerAllowed: typeof initialData?.smokerAllowed === 'boolean' ? initialData.smokerAllowed : false,
    drinkerAllowed: typeof initialData?.drinkerAllowed === 'boolean' ? initialData.drinkerAllowed : false,
    amenities: Array.isArray(initialData?.amenities) ? initialData.amenities : []
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState(initialData?.images || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const amenitiesOptions = ['WiFi', 'AC', 'Kitchen', 'Parking', 'Gym', 'Garden'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'amenities') {
      setFormData(prev => ({
        ...prev,
        amenities: checked
          ? [...prev.amenities, value]
          : prev.amenities.filter(a => a !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title || !formData.description || !formData.location || !formData.rent || !formData.availableFrom) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.availableFrom < today) {
      setError('Available from date cannot be in the past');
      return;
    }

    if (imagePreviews.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setLoading(true);
    try {
      // For now, send image file names. In production, upload to cloud storage (S3, Cloudinary, etc.)
      const postData = {
        ...formData,
        images: imagePreviews,
        imageFiles,
      };
      
      onAdd(postData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        rent: '',
        contactNumber: '',
        deposit: '',
        roomType: '1BHK',
        bhkSize: '',
        availableFrom: '',
        tenantType: 'Anyone',
        smokerAllowed: false,
        drinkerAllowed: false,
        amenities: []
      });
      setImageFiles([]);
      setImagePreviews([]);
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-dark-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-y-auto custom-scrollbar my-4">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-dark-900 hover:bg-gray-200 transition-colors"
        >
          ✕
        </button>
        
        <div className="p-8 md:p-10">
          <h2 className="text-3xl font-bold text-dark-900 mb-6">Create New Listing</h2>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload */}
            <ImageUpload 
              onImagesChange={(files, previews) => {
                setImageFiles(files);
                setImagePreviews(previews);
              }}
              maxImages={5}
              required={imagePreviews.length === 0}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-700 mb-2">Post Title *</label>
                <input 
                  required 
                  type="text" 
                  name="title" 
                  value={formData.title}
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                  placeholder="e.g. Cozy 2BHK in Mumbai"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-700 mb-2">Description *</label>
                <textarea 
                  required 
                  name="description" 
                  value={formData.description}
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all resize-none" 
                  placeholder="Describe your flat/room..."
                  rows="4"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-700 mb-2">Location *</label>
                <input 
                  required 
                  type="text" 
                  name="location" 
                  value={formData.location}
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                  placeholder="e.g. Mumbai, Bandra"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Monthly Rent (₹) *</label>
                <input 
                  required 
                  type="number" 
                  name="rent" 
                  value={formData.rent}
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                  placeholder="45000"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  placeholder="+91 9876543210"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Deposit (₹)</label>
                <input 
                  type="number" 
                  name="deposit" 
                  value={formData.deposit}
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                  placeholder="90000"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Room Type</label>
                <select 
                  name="roomType" 
                  value={formData.roomType} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all bg-white"
                  disabled={loading}
                >
                  <option value="1BHK">1BHK</option>
                  <option value="2BHK">2BHK</option>
                  <option value="3BHK">3BHK</option>
                  <option value="Studio">Studio</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">BHK Size (sq.ft)</label>
                <input 
                  type="text" 
                  name="bhkSize" 
                  value={formData.bhkSize}
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                  placeholder="900"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Available From *</label>
                <input 
                  required
                  type="date" 
                  name="availableFrom" 
                  value={formData.availableFrom}
                  onChange={handleChange} 
                  min={today}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Preferred Tenants</label>
                <select 
                  name="tenantType" 
                  value={formData.tenantType} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all bg-white"
                  disabled={loading}
                >
                  <option value="Anyone">Anyone</option>
                  <option value="Girls">Girls</option>
                  <option value="Boys">Boys</option>
                </select>
              </div>

              <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 bg-gray-50">
                <span className="text-sm font-medium text-dark-700">Smoking Allowed</span>
                <input
                  type="checkbox"
                  name="smokerAllowed"
                  checked={formData.smokerAllowed}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  disabled={loading}
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 bg-gray-50">
                <span className="text-sm font-medium text-dark-700">Drinking Allowed</span>
                <input
                  type="checkbox"
                  name="drinkerAllowed"
                  checked={formData.drinkerAllowed}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  disabled={loading}
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-3">Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenitiesOptions.map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="amenities"
                      value={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" 
                      disabled={loading}
                    />
                    <span className="text-dark-800">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-8 py-3 bg-dark-900 text-white font-medium rounded-xl hover:bg-primary-600 hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Saving...' : submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPostModal;
