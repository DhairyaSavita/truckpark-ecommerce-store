import React from 'react';
import { motion } from 'framer-motion';

const BrandBanner = ({ brand, count }) => {
  const brandColors = {
    'Tata Motors': 'from-blue-700 to-blue-800',
    'Ashok Leyland': 'from-red-600 to-red-700',
    'Mahindra': 'from-green-600 to-green-700',
    'BharatBenz': 'from-cyan-600 to-cyan-700',
    'Eicher': 'from-orange-600 to-orange-700',
    'Force Motors': 'from-purple-600 to-purple-700',
    'SML Isuzu': 'from-teal-600 to-teal-700',
    'MAN Trucks': 'from-gray-700 to-gray-800',
    'Volvo Trucks': 'from-blue-600 to-blue-700',
    'Scania': 'from-red-500 to-red-600'
  };
  
  const gradient = brandColors[brand] || 'from-gray-600 to-gray-700';
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-r ${gradient} rounded-xl p-4 text-white shadow-lg cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{brand}</h3>
          <p className="text-sm opacity-90">{count} parts available</p>
        </div>
        <div className="text-3xl font-bold opacity-20">
          {brand.split(' ')[0]}
        </div>
      </div>
    </motion.div>
  );
};

export default BrandBanner;
