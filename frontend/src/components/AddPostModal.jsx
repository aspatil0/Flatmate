import React, { useState } from 'react';

const AddPostModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    society: '', city: '', locality: '', rent: '', totalRent: '', area: '', deposit: '',
    smokerAllowed: false, drinkerAllowed: false, imagesCount: 0, tenantType: 'Anyone'
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
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
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload Mock */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Upload Images (Minimum 4)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-center">
                <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <div className="text-sm text-gray-500"><span className="text-primary-600 font-semibold">Click to upload</span> or drag and drop</div>
                <div className="text-xs text-gray-400 mt-1">PNG, JPG, up to 10MB</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-700 mb-2">Society Name / Keyword</label>
                <input required type="text" name="society" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="e.g. DLF Magnolias"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">City</label>
                <input required type="text" name="city" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="e.g. Pune"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Locality / Area</label>
                <input required type="text" name="locality" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="e.g. Yewalewadi"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Your Split Rent (₹)</label>
                <input required type="number" name="rent" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="15000"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Total Flat Rent (₹)</label>
                <input required type="number" name="totalRent" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="45000"/>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Security Deposit (₹)</label>
                <input required type="number" name="deposit" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="30000"/>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Total Area (sq.ft)</label>
                <input required type="number" name="area" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="1200"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Preferred Tenant</label>
                <select name="tenantType" value={formData.tenantType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all bg-white">
                  <option value="Anyone">Anyone</option>
                  <option value="Boys">Boys Only</option>
                  <option value="Girls">Girls Only</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" name="smokerAllowed" onChange={handleChange} className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
                <span className="text-dark-800 font-medium">Smoker Allowed</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" name="drinkerAllowed" onChange={handleChange} className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
                <span className="text-dark-800 font-medium">Drinker Allowed</span>
              </label>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
              <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
              <button type="submit" className="px-8 py-3 bg-dark-900 text-white font-medium rounded-xl hover:bg-primary-600 hover:shadow-glow transition-all">Publish Listing</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPostModal;
