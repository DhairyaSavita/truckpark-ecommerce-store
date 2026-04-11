import React, { useState, useEffect } from 'react';
import { adminSupportAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  TicketIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  MapPinIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminSupportTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState('all');
  const [updateData, setUpdateData] = useState({
    status: '',
    resolution: ''
  });

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  // const fetchTickets = async () => {
  //   setLoading(true);
  //   try {
  //     let response;
  //     if (filter === 'urgent') {
  //       response = await adminSupportAPI.getUrgentTickets();
  //     } else {
  //       response = await adminSupportAPI.getAllTickets();
  //     }
  //     console.log('Fetched tickets:', response.data);
  //     setTickets(response.data || []);
  //   } catch (error) {
  //     console.error('Error fetching tickets:', error);
  //     toast.error('Failed to load tickets');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const updateTicket = async (ticketId) => {
    try {
      await adminSupportAPI.updateTicket(ticketId, updateData);
      toast.success('Ticket updated successfully');
      setSelectedTicket(null);
      fetchTickets();
      setUpdateData({ status: '', resolution: '' });
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800 animate-pulse'
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

  const fetchTickets = async () => {
  setLoading(true);
  try {
    let response;
    if (filter === 'urgent') {
      response = await adminSupportAPI.getUrgentTickets();
    } else {
      response = await adminSupportAPI.getAllTickets();
    }
    console.log('Fetched tickets response:', response);
    console.log('Tickets data:', response.data);
    setTickets(response.data || []);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    toast.error('Failed to load tickets');
  } finally {
    setLoading(false);
  }
};

  const urgentCount = tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed').length;

  if (loading) {
    return <div className="text-center py-10">Loading tickets...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets Management</h1>
          <p className="text-gray-600 mt-1">Manage customer support requests and emergencies</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-4 py-2 rounded flex items-center ${filter === 'urgent' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
          >
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            Urgent ({urgentCount})
          </button>
        </div>
      </div>

      {urgentCount > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h3 className="font-semibold text-red-800">Urgent Tickets Pending</h3>
              <p className="text-sm text-red-700">There are {urgentCount} urgent tickets requiring immediate attention.</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No support tickets found
                   </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className={ticket.priority === 'urgent' ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 font-medium">#{ticket.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{ticket.User?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{ticket.User?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-sm text-gray-500 truncate">{ticket.message}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority === 'urgent' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View & Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Ticket #{selectedTicket.id} Details</h3>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500">Customer Information</p>
                <p className="font-semibold">{selectedTicket.User?.name}</p>
                <p className="text-sm">{selectedTicket.User?.email}</p>
                <p className="text-sm">{selectedTicket.User?.phone || 'No phone'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500">Ticket Information</p>
                <p><strong>Priority:</strong> <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${getPriorityColor(selectedTicket.priority)}`}>{selectedTicket.priority}</span></p>
                <p><strong>Status:</strong> <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${getStatusColor(selectedTicket.status)}`}>{selectedTicket.status}</span></p>
                <p><strong>Created:</strong> {new Date(selectedTicket.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-gray-700">Subject:</p>
              <p className="p-2 bg-gray-50 rounded">{selectedTicket.subject}</p>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-gray-700">Message:</p>
              <div className="p-3 bg-gray-50 rounded max-h-40 overflow-y-auto">
                <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>
            </div>

            {selectedTicket.location && (
              <div className="mb-4">
                <p className="font-semibold text-gray-700 flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  Location Shared:
                </p>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-sm">
                    {typeof selectedTicket.location === 'string' 
                      ? JSON.parse(selectedTicket.location).address 
                      : selectedTicket.location?.address}
                  </p>
                </div>
              </div>
            )}

            {selectedTicket.resolution && (
              <div className="mb-4">
                <p className="font-semibold text-gray-700">Resolution:</p>
                <div className="p-2 bg-green-50 rounded">
                  <p className="text-sm">{selectedTicket.resolution}</p>
                </div>
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-3">Update Ticket</h4>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Update Status</label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Resolution Notes</label>
                  <textarea
                    value={updateData.resolution}
                    onChange={(e) => setUpdateData({ ...updateData, resolution: e.target.value })}
                    rows="2"
                    className="w-full border rounded px-3 py-2"
                    placeholder="Add resolution notes..."
                  />
                </div>
              </div>
              <button
                onClick={() => updateTicket(selectedTicket.id)}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Update Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupportTickets;
