import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { driverAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TruckIcon, MapPinIcon, CurrencyRupeeIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const BecomeDriver = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    license_number: '',
    license_expiry: '',
    experience_years: '',
    hourly_rate: '',
    daily_rate: '',
    home_city: '',
    vehicle_type: '',
    bio: ''
  });

  const vehicleTypes = ['Truck - 10 Wheeler', 'Truck - 12 Wheeler', 'Container Truck', 'Tipper Truck', 'Tanker Truck', 'Flatbed Truck', 'Refrigerated Truck', 'Pickup Truck'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.license_number) {
      toast.error('Please enter license number');
      return;
    }
    
    if (!formData.experience_years) {
      toast.error('Please enter years of experience');
      return;
    }
    
    setLoading(true);
    try {
      await driverAPI.register(formData);
      toast.success('Driver application submitted! Awaiting verification.');
      navigate('/driver/dashboard');
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
        <TruckIcon className="h-16 w-16 mx-auto text-orange-600 mb-4" />
        <h1 className="text-3xl font-bold">Become a Driver</h1>
        <p className="text-gray-600 mt-2">Join our network of professional truck drivers</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                License Number *
              </label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                placeholder="Your driver license number"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">License Expiry Date</label>
              <input
                type="date"
                name="license_expiry"
                value={formData.license_expiry}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <ClockIcon className="h-4 w-4 inline mr-1" />
                Years of Experience *
              </label>
              <input
                type="number"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                required
                min="0"
                max="50"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <CurrencyRupeeIcon className="h-4 w-4 inline mr-1" />
                Hourly Rate (₹) *
              </label>
              <input
                type="number"
                name="hourly_rate"
                value={formData.hourly_rate}
                onChange={handleChange}
                required
                min="100"
                step="50"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., 500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <CurrencyRupeeIcon className="h-4 w-4 inline mr-1" />
                Daily Rate (₹)
              </label>
              <input
                type="number"
                name="daily_rate"
                value={formData.daily_rate}
                onChange={handleChange}
                min="500"
                step="100"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., 5000"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <MapPinIcon className="h-4 w-4 inline mr-1" />
                Home City *
              </label>
              <input
                type="text"
                name="home_city"
                value={formData.home_city}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                placeholder="Your home city"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Vehicle Type *</label>
              <select
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Vehicle Type</option>
                {vehicleTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Bio / About You</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
              placeholder="Tell customers about your experience and expertise..."
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Benefits of joining:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>✓ Get trip requests from customers in your area</li>
              <li>✓ Set your own rates and working hours</li>
              <li>✓ Build your reputation with customer ratings</li>
              <li>✓ Weekly payouts with low commission (10%)</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BecomeDriver;
