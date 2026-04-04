import React, { useState } from 'react';

const ImageUpload = ({ onImagesChange, maxImages = 5, required = true }) => {
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setError('');

    // Validate number of images
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate file sizes and types
    const validFiles = [];
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('Image must be less than 5MB');
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    // Create previews
    const newPreviews = validFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPreviews).then(results => {
      const updatedImages = [...images, ...validFiles];
      const updatedPreviews = [...previews, ...results];
      
      setImages(updatedImages);
      setPreviews(updatedPreviews);
      // Pass both files and previews
      onImagesChange(updatedImages, updatedPreviews);
    });
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    
    setImages(updatedImages);
    setPreviews(updatedPreviews);
    // Pass both files and previews
    onImagesChange(updatedImages, updatedPreviews);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-dark-700 mb-2">
        Upload Images {required && '*'} (Max {maxImages})
      </label>
      
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Upload Area */}
      <label className="block border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-center">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          disabled={images.length >= maxImages}
        />
        <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <div className="text-sm text-gray-500">
          <span className="text-primary-600 font-semibold">Click to upload</span> or drag and drop
        </div>
        <div className="text-xs text-gray-400 mt-1">PNG, JPG, up to 5MB each</div>
        {images.length > 0 && (
          <div className="text-xs text-primary-600 font-semibold mt-2">
            {images.length} / {maxImages} images selected
          </div>
        )}
      </label>

      {/* Preview Section */}
      {previews.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-dark-700 mb-3">Image Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
                <p className="text-xs text-gray-500 mt-1 text-center truncate">
                  Image {index + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
