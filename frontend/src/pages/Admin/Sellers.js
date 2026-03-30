import React, { useState, useEffect } from 'react';
import { admin } from '../../services/api';
import toast from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await admin.getSellers();
      setSellers(response.data);
    } catch (error) {
      toast.error('Failed to fetch sellers');
    } finally {
      setLoading(false);
    }
  };

  const approveSeller = async (sellerId) => {
    try {
      await admin.approveSeller(sellerId);
      toast.success('Seller approved successfully! They can now list products.');
      fetchSellers();
      setSelectedSeller(null);
    } catch (error) {
      toast.error('Failed to approve seller');
    }
  };

  const rejectSeller = async (sellerId) => {
    if (!rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await admin.rejectSeller(sellerId, rejectionReason);
      toast.success('Seller rejected');
      fetchSellers();
      setSelectedSeller(null);
      setRejectionReason('');
    } catch (error) {
      toast.error('Failed to reject seller');
    }
  };

  const getStatusBadge = (seller) => {
    if (seller.role === 'seller' && seller.is_approved === true) {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Approved</span>;
    }
    if (seller.is_approved === false && seller.store_name) {
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">Rejected</span>;
    }
    if (seller.store_name && seller.role === 'user' && seller.is_approved === false) {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">Pending Approval</span>;
    }
    if (seller.role === 'seller') {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Active Seller</span>;
    }
    return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold">User</span>;
  };

  if (loading) {
    return <div className="text-center py-10">Loading sellers...</div>;
  }

  const pendingSellers = sellers.filter(s => s.store_name && s.role === 'user' && s.is_approved === false);
  const approvedSellers = sellers.filter(s => s.role === 'seller' && s.is_approved === true);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Seller Management</h1>
      
      {/* Pending Applications Section */}
      {pendingSellers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-yellow-600">Pending Applications ({pendingSellers.length})</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingSellers.map((seller) => (
                  <tr key={seller.id}>
                    <td className="px-6 py-4 font-medium">{seller.store_name}</td>
                    <td className="px-6 py-4">{seller.name}</td>
                    <td className="px-6 py-4">{seller.email}</td>
                    <td className="px-6 py-4">{new Date(seller.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedSeller(seller)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => approveSeller(seller.id)}
                        className="text-green-600 hover:text-green-800 mr-3"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setSelectedSeller(seller)}
                        className="text-red-600 hover:text-red-800"
                      >
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
      
      {/* Approved Sellers Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-green-600">Approved Sellers ({approvedSellers.length})</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {approvedSellers.map((seller) => (
                <tr key={seller.id}>
                  <td className="px-6 py-4 font-medium">{seller.store_name}</td>
                  <td className="px-6 py-4">{seller.name}</td>
                  <td className="px-6 py-4">{seller.email}</td>
                  <td className="px-6 py-4">${seller.total_sales || 0}</td>
                  <td className="px-6 py-4">{new Date(seller.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seller Details Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Seller Application Details</h3>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700">Store Information</h4>
                <div className="bg-gray-50 p-3 rounded mt-1">
                  <p><strong>Store Name:</strong> {selectedSeller.store_name}</p>
                  <p><strong>Store Description:</strong> {selectedSeller.store_description || 'Not provided'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700">Owner Information</h4>
                <div className="bg-gray-50 p-3 rounded mt-1">
                  <p><strong>Name:</strong> {selectedSeller.name}</p>
                  <p><strong>Email:</strong> {selectedSeller.email}</p>
                  <p><strong>Phone:</strong> {selectedSeller.phone || 'Not provided'}</p>
                  <p><strong>Address:</strong> {selectedSeller.address || 'Not provided'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700">Bank Details</h4>
                <div className="bg-gray-50 p-3 rounded mt-1">
                  <p><strong>Bank Name:</strong> {selectedSeller.bank_name || 'Not provided'}</p>
                  <p><strong>Account Number:</strong> {selectedSeller.bank_account || 'Not provided'}</p>
                  <p><strong>Tax ID:</strong> {selectedSeller.tax_id || 'Not provided'}</p>
                </div>
              </div>
              
              {selectedSeller.is_approved === false && selectedSeller.rejection_reason && (
                <div>
                  <h4 className="font-semibold text-red-700">Rejection Reason</h4>
                  <div className="bg-red-50 p-3 rounded mt-1">
                    <p>{selectedSeller.rejection_reason}</p>
                  </div>
                </div>
              )}
              
              {selectedSeller.role === 'user' && selectedSeller.is_approved === false && !selectedSeller.rejection_reason && (
                <div>
                  <h4 className="font-semibold text-gray-700">Rejection Reason (if rejecting)</h4>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full border rounded px-3 py-2 mt-1"
                    rows="3"
                  />
                </div>
              )}
            </div>
            
            {selectedSeller.role === 'user' && selectedSeller.is_approved === false && !selectedSeller.rejection_reason && (
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => rejectSeller(selectedSeller.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => approveSeller(selectedSeller.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            )}
            
            {(selectedSeller.role === 'seller' || selectedSeller.rejection_reason) && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedSeller(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellers;
