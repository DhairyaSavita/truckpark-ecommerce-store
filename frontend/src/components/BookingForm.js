import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../services/api';
import { CalendarIcon, MapPinIcon, ClockIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const BookingForm = ({ productId, productName, onClose }) => {
  const { user } = useAuth();
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    mechanic_id: '',
    booking_date: '',
    booking_time: '',
    service_address: '',
    notes: ''
  });

  useEffect(() => {
    fetchMechanics();
    if (user?.address) {
      setFormData(prev => ({ ...prev, service_address: user.address }));
    }
  }, []);

  const fetchMechanics = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getMechanics();
      setMechanics(response.data);
    } catch (error) {
      toast.error('Failed to load mechanics');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to book installation');
      return;
    }

    if (!formData.mechanic_id || !formData.booking_date || !formData.booking_time || !formData.service_address) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await bookingAPI.createBooking({
        product_id: productId,
        ...formData
      });
      toast.success('Installation booked successfully! Mechanic will contact you soon.');
      onClose?.();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to book installation');
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Book Installation Service</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p className="font-semibold">Product: {productName}</p>
          <p className="text-sm text-gray-600">Professional installation by certified mechanics</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Mechanic Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Select Mechanic *</label>
            {loading ? (
              <div className="text-center py-4">Loading mechanics...</div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {mechanics.map(mechanic => (
                  <label key={mechanic.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="mechanic_id"
                      value={mechanic.id}
                      checked={formData.mechanic_id === mechanic.id}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-semibold">{mechanic.User?.name}</span>
                        <span className="text-green-600">⭐ {mechanic.rating || 'New'}</span>
                      </div>
                      <div className="text-sm text-gray-500">{mechanic.specialization}</div>
                      <div className="text-sm text-gray-500">Experience: {mechanic.experience_years} years</div>
                      <div className="text-sm font-semibold text-blue-600">₹{mechanic.hourly_rate}/hour</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Booking Date *
              </label>
              <select
                name="booking_date"
                value={formData.booking_date}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Date</option>
                {getAvailableDates().map(date => (
                  <option key={date.toISOString()} value={date.toISOString().split('T')[0]}>
                    {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <ClockIcon className="h-4 w-4 inline mr-1" />
                Booking Time *
              </label>
              <select
                name="booking_time"
                value={formData.booking_time}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              <MapPinIcon className="h-4 w-4 inline mr-1" />
              Service Address *
            </label>
            <textarea
              name="service_address"
              value={formData.service_address}
              onChange={handleChange}
              required
              rows="2"
              className="w-full border rounded px-3 py-2"
              placeholder="Enter your complete address for service"
            />
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              className="w-full border rounded px-3 py-2"
              placeholder="Any special instructions or requirements?"
            />
          </div>

          {/* Estimated Cost */}
          {formData.mechanic_id && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="font-semibold">Estimated Cost Breakdown:</p>
              <div className="flex justify-between text-sm mt-2">
                <span>Service Call (2 hours estimated)</span>
                <span>₹{mechanics.find(m => m.id === formData.mechanic_id)?.hourly_rate * 2}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Travel Charges</span>
                <span>₹200</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>Total Estimated</span>
                <span>₹{(mechanics.find(m => m.id === formData.mechanic_id)?.hourly_rate * 2) + 200}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">* Final cost may vary based on actual time and parts</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
