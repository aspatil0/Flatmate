import React from 'react';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary-100 shadow-sm hover:shadow-soft transition-all duration-300 group">
      <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-dark-900 mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
