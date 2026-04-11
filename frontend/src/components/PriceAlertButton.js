import React, { useState } from 'react';
import { BellIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import { priceAlertAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PriceAlertButton = ({ productId, productName, currentPrice }) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);

  const handleSetAlert = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to set price alerts');
      return;
    }

    if (!targetPrice || targetPrice <= 0) {
      toast.error('Please enter a valid target price');
      return;
    }

    setLoading(true);
    try {
      await priceAlertAPI.create({
        product_id: productId,
        target_price: parseFloat(targetPrice)
      });
      toast.success(`Price alert set for ₹${targetPrice}. We'll notify you when price drops!`);
      setShowModal(false);
      setTargetPrice('');
      setHasAlert(true);
    } catch (error) {
      console.error('Error setting price alert:', error);
      toast.error(error.response?.data?.error || 'Failed to set price alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        title="Set Price Alert"
      >
        {hasAlert ? (
          <BellAlertIcon className="h-6 w-6 text-yellow-500" />
        ) : (
          <BellIcon className="h-6 w-6 text-gray-500 hover:text-yellow-500" />
        )}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowModal(false)}>
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Set Price Alert</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">Product: <span className="font-semibold">{productName}</span></p>
              <p className="text-gray-600 mb-4">Current Price: <span className="font-semibold text-blue-600">₹{currentPrice}</span></p>
              <label className="block text-gray-700 mb-2">Target Price (₹)</label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="Enter price you want to pay"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-2">
                We'll notify you when the price drops to or below ₹{targetPrice || 'your target price'}
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSetAlert}
                disabled={loading || !targetPrice}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Setting...' : 'Set Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PriceAlertButton;
