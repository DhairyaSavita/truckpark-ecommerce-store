import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logisticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TruckIcon, MapPinIcon, CurrencyRupeeIcon, ShieldCheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const BecomeLogistics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    gst_number: '',
    registration_number: '',
    year_established: '',
    vehicle_count: '',
    service_pincodes: [],
    insurance_available: false,
    tracking_available: false,
    website: '',
    description: ''
  });
  const [pincodeInput, setPincodeInput] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const addPincode = () => {
    if (pincodeInput && pincodeInput.length === 6 && !formData.service_pincodes.includes(pincodeInput)) {
      setFormData({
        ...formData,
        service_pincodes: [...formData.service_pincodes, pincodeInput]
      });
      setPincodeInput('');
    } else {
      toast.error('Please enter a valid 6-digit pincode');
    }
  };

  const removePincode = (pincode) => {
    setFormData({
      ...formData,
      service_pincodes: formData.service_pincodes.filter(p => p !== pincode)
    });
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
    
    if (formData.service_pincodes.length === 0) {
      toast.error('Please add at least one service pincode');
      return;
    }
    
    setLoading(true);
    try {
      await logisticsAPI.register(formData);
      toast.success('Logistics partner application submitted! Awaiting verification.');
      navigate('/logistics/dashboard');
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
        <TruckIcon className="h-16 w-16 mx-auto text-primary-600 mb-4" />
        <h1 className="text-3xl font-bold">Become a Logistics Partner</h1>
        <p className="text-gray-600 mt-2">Join our network of trusted logistics providers</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TruckIcon className="h-5 w-5 mr-2 text-primary-600" />
              Company Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Company Name *</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                  placeholder="Your logistics company name"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">GST Number *</label>
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
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Registration Number</label>
                <input
                  type="text"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                  placeholder="Company registration number"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Year Established</label>
                <input
                  type="number"
                  name="year_established"
                  value={formData.year_established}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 2010"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Number of Vehicles *</label>
                <input
                  type="number"
                  name="vehicle_count"
                  value={formData.vehicle_count}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                  placeholder="Total vehicles in fleet"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>
          </div>

          {/* Service Area */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-primary-600" />
              Service Area
            </h2>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Service Pincodes *</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value)}
                  placeholder="Enter 6-digit pincode"
                  maxLength="6"
                  className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={addPincode}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.service_pincodes.map(pincode => (
                  <span key={pincode} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                    {pincode}
                    <button
                      type="button"
                      onClick={() => removePincode(pincode)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Services & Features */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2 text-primary-600" />
              Services & Features
            </h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="insurance_available"
                  checked={formData.insurance_available}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-primary-600"
                />
                <span>Insurance Available for Shipments</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="tracking_available"
                  checked={formData.tracking_available}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-primary-600"
                />
                <span>Real-time Tracking Available</span>
              </label>
            </div>
          </div>

          {/* Company Description */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <GlobeAltIcon className="h-5 w-5 mr-2 text-primary-600" />
              Company Description
            </h2>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
              placeholder="Describe your logistics services, coverage, and specialties..."
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Benefits of becoming a logistics partner:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>✓ Get shipment requests from businesses across India</li>
              <li>✓ Set your own service areas and rates</li>
              <li>✓ Build reputation with customer ratings</li>
              <li>✓ Access to insurance and tracking features</li>
              <li>✓ Weekly payouts with competitive commission (8%)</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BecomeLogistics;
