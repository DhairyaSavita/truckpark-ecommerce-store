import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { refurbisherAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowPathIcon, BuildingStorefrontIcon, MapPinIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const BecomeRefurbisher = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    gst_number: '',
    warehouse_address: '',
    license_number: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.company_name) {
      toast.error('Please enter company name');
      return;
    }
    
    if (!formData.gst_number) {
      toast.error('Please enter GST number');
      return;
    }
    
    setLoading(true);
    try {
      await refurbisherAPI.register(formData);
      toast.success('Refurbisher application submitted! Awaiting verification.');
      navigate('/refurbisher/dashboard');
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
    <div className="container mx-auto px-4 py-8 max-w-4xl pt-20">
      <div className="text-center mb-8">
        <ArrowPathIcon className="h-16 w-16 mx-auto text-green-600 mb-4" />
        <h1 className="text-3xl font-bold">Become a Refurbisher / Scrap Dealer</h1>
        <p className="text-gray-600 mt-2">Sell refurbished parts and participate in our auction system</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <BuildingStorefrontIcon className="h-4 w-4 inline mr-1" />
                Company Name *
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                placeholder="Your refurbishing company name"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                GST Number *
              </label>
              <input
                type="text"
                name="gst_number"
                value={formData.gst_number}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                placeholder="GSTIN (e.g., 22AAAAA0000A1Z)"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">
                <MapPinIcon className="h-4 w-4 inline mr-1" />
                Warehouse Address *
              </label>
              <textarea
                name="warehouse_address"
                value={formData.warehouse_address}
                onChange={handleChange}
                required
                rows="2"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                placeholder="Your warehouse address where refurbished parts are stored"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">License Number</label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                placeholder="Scrap dealer license number (if any)"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Benefits of becoming a refurbisher:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>✓ Sell refurbished truck parts at competitive prices</li>
              <li>✓ Create timed auctions for premium parts</li>
              <li>✓ Reach thousands of buyers looking for affordable parts</li>
              <li>✓ Get verified badge for trust and credibility</li>
              <li>✓ Weekly payouts with competitive commission (8%)</li>
              <li>✓ Access to scrap request system</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BecomeRefurbisher;
