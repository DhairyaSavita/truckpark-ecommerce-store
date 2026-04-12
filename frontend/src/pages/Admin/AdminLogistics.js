import React, { useState, useEffect } from 'react';
import { admin } from '../../services/api';
import toast from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';

const AdminLogistics = () => {
  const [logistics, setLogistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogistics, setSelectedLogistics] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchLogistics();
  }, []);

  const fetchLogistics = async () => {
    try {
      const response = await admin.getLogistics();
      setLogistics(response.data);
    } catch (error) {
      toast.error('Failed to fetch logistics companies');
    } finally {
      setLoading(false);
    }
  };

  const approveLogistics = async (id) => {
    try {
      await admin.approveLogistics(id);
      toast.success('Logistics company approved successfully');
      fetchLogistics();
      setSelectedLogistics(null);
    } catch (error) {
      toast.error('Failed to approve logistics company');
    }
  };

  const rejectLogistics = async (id) => {
    if (!rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await admin.rejectLogistics(id, rejectionReason);
      toast.success('Logistics company rejected');
      fetchLogistics();
      setSelectedLogistics(null);
      setRejectionReason('');
    } catch (error) {
      toast.error('Failed to reject logistics company');
    }
  };

  const getStatusBadge = (logisticsItem) => {
    if (logisticsItem.logistics_verified) {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Verified</span>;
    }
    return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">Pending</span>;
  };

  const pendingLogistics = logistics.filter(l => !l.logistics_verified);
  const verifiedLogistics = logistics.filter(l => l.logistics_verified);

  if (loading) {
    return <div className="text-center py-10">Loading logistics companies...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Logistics Management</h1>
      
      {pendingLogistics.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-yellow-600">Pending Applications ({pendingLogistics.length})</h2>
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingLogistics.map((logisticsItem) => (
                  <tr key={logisticsItem.id}>
                    <td className="px-6 py-4 font-medium">{logisticsItem.logistics_company_name}</td>
                    <td className="px-6 py-4">{logisticsItem.name}</td>
                    <td className="px-6 py-4">{logisticsItem.logistics_vehicle_count || 0}</td>
                    <td className="px-6 py-4">{getStatusBadge(logisticsItem)}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => setSelectedLogistics(logisticsItem)} className="text-blue-600 hover:text-blue-800 mr-3">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => approveLogistics(logisticsItem.id)} className="text-green-600 hover:text-green-800 mr-3">
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => setSelectedLogistics(logisticsItem)} className="text-red-600 hover:text-red-800">
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold mb-4 text-green-600">Verified Logistics ({verifiedLogistics.length})</h2>
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {verifiedLogistics.map((logisticsItem) => (
                <tr key={logisticsItem.id}>
                  <td className="px-6 py-4 font-medium">{logisticsItem.logistics_company_name}</td>
                  <td className="px-6 py-4">{logisticsItem.name}</td>
                  <td className="px-6 py-4">{logisticsItem.logistics_vehicle_count || 0}</td>
                  <td className="px-6 py-4">{getStatusBadge(logisticsItem)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLogistics && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Logistics Company Details</h3>
              <button onClick={() => setSelectedLogistics(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <p><strong>Company:</strong> {selectedLogistics.logistics_company_name}</p>
                <p><strong>GST:</strong> {selectedLogistics.logistics_gst_number || 'N/A'}</p>
                <p><strong>Vehicles:</strong> {selectedLogistics.logistics_vehicle_count || 0}</p>
                <p><strong>Insurance:</strong> {selectedLogistics.logistics_insurance_available ? 'Yes' : 'No'}</p>
                <p><strong>Tracking:</strong> {selectedLogistics.logistics_tracking_available ? 'Yes' : 'No'}</p>
                <p><strong>Service Pincodes:</strong> {selectedLogistics.logistics_service_pincodes?.join(', ') || 'All India'}</p>
                <p><strong>Description:</strong> {selectedLogistics.logistics_description || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p><strong>Owner:</strong> {selectedLogistics.name}</p>
                <p><strong>Email:</strong> {selectedLogistics.email}</p>
                <p><strong>Phone:</strong> {selectedLogistics.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedLogistics.address || 'N/A'}</p>
              </div>
              {!selectedLogistics.logistics_verified && (
                <div>
                  <label className="block text-gray-700 mb-1">Rejection Reason</label>
                  <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows="3" className="w-full border rounded px-3 py-2" placeholder="Enter reason for rejection..." />
                </div>
              )}
            </div>
            {!selectedLogistics.logistics_verified && (
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => rejectLogistics(selectedLogistics.id)} className="px-4 py-2 bg-red-600 text-white rounded">Reject</button>
                <button onClick={() => approveLogistics(selectedLogistics.id)} className="px-4 py-2 bg-green-600 text-white rounded">Approve</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogistics;
