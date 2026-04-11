import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const BecomeSeller = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    store_name: '',
    store_description: '',
    bank_account: '',
    bank_name: '',
    tax_id: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authAPI.becomeSeller(formData);
      toast.success('Seller application submitted! Admin will review it.');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Become a Seller</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold text-blue-900 mb-2">Why become a seller?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Reach thousands of truck owners and mechanics</li>
            <li>✓ No monthly fees - pay only when you sell</li>
            <li>✓ Easy product listing and management</li>
            <li>✓ Secure payment processing</li>
            <li>✓ Dedicated seller support</li>
          </ul>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Store Name *</label>
            <input
              type="text"
              name="store_name"
              value={formData.store_name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Your store name"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Store Description</label>
            <textarea
              name="store_description"
              value={formData.store_description}
              onChange={handleChange}
              rows="4"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your store and what you sell"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Bank Account Number *</label>
            <input
              type="text"
              name="bank_account"
              value={formData.bank_account}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Your bank account number"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Bank Name *</label>
            <input
              type="text"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Your bank name"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Tax ID / GST Number</label>
            <input
              type="text"
              name="tax_id"
              value={formData.tax_id}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Your tax ID"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BecomeSeller;
