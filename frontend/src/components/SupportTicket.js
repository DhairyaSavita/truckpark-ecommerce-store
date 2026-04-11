import React, { useState, useEffect } from 'react';
import { supportAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, ChatBubbleLeftRightIcon, MapPinIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import LocationPicker from './LocationPicker';
import toast from 'react-hot-toast';

const SupportTicket = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium',
    location: null
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await supportAPI.getMyTickets();
      console.log('Fetched tickets:', response.data);
      setTickets(response.data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const ticketData = {
      ...formData,
      location: formData.location ? JSON.stringify(formData.location) : null
    };

    try {
      await supportAPI.createTicket(ticketData);
      toast.success('Support ticket created successfully');
      setShowModal(false);
      setShowEmergencyForm(false);
      setFormData({ subject: '', message: '', priority: 'medium', location: null });
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error(error.response?.data?.error || 'Failed to create ticket');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.open;
  };

  if (loading) {
    return <div className="text-center py-10">Loading tickets...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Support Tickets</h1>
          <p className="text-gray-600 mt-1">Track your support requests and emergencies</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setShowEmergencyForm(true);
              setFormData({
                subject: 'EMERGENCY - Immediate Assistance Required',
                message: 'URGENT: Need immediate assistance. Please contact me as soon as possible.',
                priority: 'urgent',
                location: null
              });
              setShowModal(true);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
          >
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            Emergency
          </button>
          <button
            onClick={() => {
              setShowEmergencyForm(false);
              setFormData({ subject: '', message: '', priority: 'medium', location: null });
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Ticket
          </button>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <ChatBubbleLeftRightIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
          <p className="text-gray-500 mb-4">Create a support ticket for assistance</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Ticket #{ticket.id}</p>
                    <p className="text-sm text-gray-500">{ticket.subject}</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-700">{ticket.message}</p>
                {ticket.location && (
                  <div className="mt-3 p-2 bg-gray-50 rounded flex items-start space-x-2">
                    <MapPinIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">Location Shared:</p>
                      <p className="text-xs text-gray-600">
                        {typeof ticket.location === 'string' ? JSON.parse(ticket.location).address : ticket.location?.address}
                      </p>
                    </div>
                  </div>
                )}
                {ticket.resolution && (
                  <div className="mt-3 p-3 bg-green-50 rounded">
                    <p className="text-sm font-semibold text-green-800">Resolution:</p>
                    <p className="text-sm text-green-700">{ticket.resolution}</p>
                  </div>
                )}
                <div className="mt-3 text-sm text-gray-500">
                  Created: {new Date(ticket.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Ticket Modal - Same as before */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {showEmergencyForm ? 'Emergency Request' : 'Create Support Ticket'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            {showEmergencyForm && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 font-semibold">⚠️ Emergency Request</p>
                <p className="text-sm text-red-700">This is an urgent request. Our support team will contact you immediately.</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief summary of your issue"
                  readOnly={showEmergencyForm}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Priority *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={showEmergencyForm}
                >
                  <option value="low">Low - General inquiry</option>
                  <option value="medium">Medium - Need assistance</option>
                  <option value="high">High - Urgent issue</option>
                  <option value="urgent">Urgent - Emergency / Immediate help needed</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows="4"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your issue in detail..."
                  readOnly={showEmergencyForm}
                />
              </div>
              
              {(formData.priority === 'urgent' || formData.priority === 'high' || showEmergencyForm) && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">
                    <MapPinIcon className="h-4 w-4 inline mr-1" />
                    Your Location (Recommended for emergency)
                  </label>
                  <LocationPicker 
                    onLocationSelect={(location) => setFormData({ ...formData, location })}
                    initialAddress={formData.location?.address}
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className={`px-4 py-2 rounded text-white ${showEmergencyForm ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {showEmergencyForm ? 'Submit Emergency Request' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicket;
