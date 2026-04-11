import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CalendarIcon, MapPinIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const InstallationsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mechanics, setMechanics] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_id: '',
    mechanic_id: '',
    booking_date: '',
    booking_time: '',
    service_address: '',
    notes: ''
  });

  useEffect(() => {
    fetchBookings();
    fetchMechanics();
    
    // Check URL params for product
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('product');
    if (productId) {
      setSelectedProduct(productId);
      setFormData(prev => ({ ...prev, product_id: productId }));
      setShowBookingModal(true);
    }
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchMechanics = async () => {
    try {
      const response = await bookingAPI.getMechanics();
      setMechanics(response.data);
    } catch (error) {
      console.error('Error fetching mechanics:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.product_id || !formData.booking_date || !formData.booking_time || !formData.service_address) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await bookingAPI.createBooking(formData);
      toast.success('Installation booked successfully!');
      setShowBookingModal(false);
      setFormData({
        product_id: '',
        mechanic_id: '',
        booking_date: '',
        booking_time: '',
        service_address: user?.address || '',
        notes: ''
      });
      fetchBookings();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.error || 'Failed to create booking');
    }
  };

  const cancelBooking = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingAPI.cancelBooking(id);
        toast.success('Booking cancelled');
        fetchBookings();
      } catch (error) {
        toast.error('Failed to cancel booking');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return <div className="text-center py-10">Loading bookings...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Installation Bookings</h1>
          <p className="text-gray-600 mt-1">Track your service appointments</p>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Book Installation
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <CalendarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-500 mb-4">Book installation service for your purchased products</p>
          <button
            onClick={() => setShowBookingModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Book Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  <span className="text-sm text-gray-500">Booking #{booking.id}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{booking.Product?.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>{booking.booking_time}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span>{booking.service_address}</span>
                  </div>
                </div>
                {booking.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                    <p className="text-gray-600">{booking.notes}</p>
                  </div>
                )}
                {booking.status === 'pending' && (
                  <button
                    onClick={() => cancelBooking(booking.id)}
                    className="mt-3 w-full text-red-600 border border-red-600 py-2 rounded hover:bg-red-50 transition text-sm"
                  >
                    Cancel Booking
                  </button>
                )}
                {booking.status === 'completed' && (
                  <div className="mt-3 flex items-center justify-center text-green-600 text-sm">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Service Completed
                  </div>
                )}
                {booking.status === 'cancelled' && (
                  <div className="mt-3 flex items-center justify-center text-red-600 text-sm">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    Booking Cancelled
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Book Installation</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Product ID *</label>
                <input
                  type="text"
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter product ID"
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Select Mechanic</label>
                <select
                  value={formData.mechanic_id}
                  onChange={(e) => setFormData({ ...formData, mechanic_id: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Mechanic</option>
                  {mechanics.map(m => (
                    <option key={m.id} value={m.id}>{m.name} - ₹{m.hourly_rate}/hour</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Booking Date *</label>
                <input
                  type="date"
                  value={formData.booking_date}
                  onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Booking Time *</label>
                <select
                  value={formData.booking_time}
                  onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Time</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Service Address *</label>
                <textarea
                  value={formData.service_address}
                  onChange={(e) => setFormData({ ...formData, service_address: e.target.value })}
                  required
                  rows="2"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter your address"
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="2"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Any special instructions?"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowBookingModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Book Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallationsPage;
