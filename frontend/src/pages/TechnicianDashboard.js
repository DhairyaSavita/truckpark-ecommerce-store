import React, { useState, useEffect } from 'react';
import { technicianAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  WrenchScrewdriverIcon, 
  CurrencyRupeeIcon, 
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [earnings, setEarnings] = useState({ total_earnings: 0, pending_earnings: 0, completed_jobs: 0 });
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [nearbyRes, myRequestsRes, earningsRes] = await Promise.all([
        technicianAPI.getNearbyRequests(),
        technicianAPI.getMyRequests(),
        technicianAPI.getEarnings()
      ]);
      setNearbyRequests(nearbyRes.data);
      setMyRequests(myRequestsRes.data);
      setEarnings(earningsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      await technicianAPI.acceptRequest(requestId);
      toast.success('Service request accepted!');
      fetchData();
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    try {
      await technicianAPI.updateRequestStatus(requestId, status);
      toast.success(`Request ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const toggleAvailability = async () => {
    try {
      await technicianAPI.updateAvailability(!isAvailable);
      setIsAvailable(!isAvailable);
      toast.success(isAvailable ? 'You are now offline' : 'You are now online');
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Technician Dashboard</h1>
            <p className="text-gray-600">Manage your service requests and earnings</p>
          </div>
          <button
            onClick={toggleAvailability}
            className={`px-4 py-2 rounded-lg font-semibold ${
              isAvailable ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
            }`}
          >
            {isAvailable ? 'Online' : 'Offline'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">₹{earnings.total_earnings}</p>
              </div>
              <CurrencyRupeeIcon className="h-10 w-10 text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed Jobs</p>
                <p className="text-2xl font-bold text-blue-600">{earnings.completed_jobs}</p>
              </div>
              <CheckCircleIcon className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Earnings</p>
                <p className="text-2xl font-bold text-yellow-600">₹{earnings.pending_earnings}</p>
              </div>
              <ClockIcon className="h-10 w-10 text-yellow-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Nearby Requests */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Nearby Service Requests</h2>
          {nearbyRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-500">No pending service requests in your area</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearbyRequests.map(request => (
                <div key={request.id} className="bg-white rounded-xl shadow-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{request.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {request.service_address}
                        </span>
                        <span>💰 ₹{request.estimated_cost}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => acceptRequest(request.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Requests */}
        <div>
          <h2 className="text-xl font-bold mb-4">My Service Requests</h2>
          {myRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-500">No assigned service requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map(request => (
                <div key={request.id} className="bg-white rounded-xl shadow-md p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{request.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{request.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Customer: {request.Customer?.name}</span>
                        <span>📍 {request.service_address}</span>
                        <span>💰 ₹{request.estimated_cost}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {request.status === 'accepted' && (
                        <button
                          onClick={() => updateRequestStatus(request.id, 'in_progress')}
                          className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Start Service
                        </button>
                      )}
                      {request.status === 'in_progress' && (
                        <button
                          onClick={() => updateRequestStatus(request.id, 'completed')}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
