import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { technicianAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { WrenchScrewdriverIcon, MapPinIcon, CurrencyRupeeIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const BecomeTechnician = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    specialization: [],
    experience_years: '',
    license_number: '',
    hourly_rate: '',
    service_radius: 50,
    address: '',
    bio: ''
  });

  const specializations = [
    'Engine Repair', 'Transmission Service', 'Brake System', 
    'Electrical System', 'AC Service', 'Suspension', 
    'Tire Service', 'General Service', 'Emergency Repair'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSpecializationToggle = (spec) => {
    if (formData.specialization.includes(spec)) {
      setFormData({
        ...formData,
        specialization: formData.specialization.filter(s => s !== spec)
      });
    } else {
      setFormData({
        ...formData,
        specialization: [...formData.specialization, spec]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.specialization.length === 0) {
      toast.error('Please select at least one specialization');
      return;
    }
    
    if (!formData.experience_years) {
      toast.error('Please enter years of experience');
      return;
    }
    
    if (!formData.hourly_rate) {
      toast.error('Please enter your hourly rate');
      return;
    }
    
    setLoading(true);
    try {
      await technicianAPI.register(formData);
      toast.success('Technician application submitted! Awaiting verification.');
      navigate('/technician/dashboard');
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
        <WrenchScrewdriverIcon className="h-16 w-16 mx-auto text-blue-600 mb-4" />
        <h1 className="text-3xl font-bold">Become a Service Technician</h1>
        <p className="text-gray-600 mt-2">Join our network of professional truck technicians</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Specializations */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3">Specializations *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {specializations.map(spec => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => handleSpecializationToggle(spec)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    formData.specialization.includes(spec)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">License Number</label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Your mechanic license number"
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
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <MapPinIcon className="h-4 w-4 inline mr-1" />
                Service Radius (km) *
              </label>
              <input
                type="number"
                name="service_radius"
                value={formData.service_radius}
                onChange={handleChange}
                required
                min="10"
                max="200"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Service Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows="2"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Your workshop address"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Bio / About You</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Tell customers about your experience and expertise..."
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Benefits of joining:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>✓ Get service requests from truck owners in your area</li>
              <li>✓ Set your own rates and working hours</li>
              <li>✓ Build your reputation with customer ratings</li>
              <li>✓ Access to genuine spare parts at wholesale prices</li>
              <li>✓ Weekly payouts with low commission (10%)</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BecomeTechnician;
