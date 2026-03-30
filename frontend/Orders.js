import React, { useState, useEffect } from 'react';
import { orders, admin } from '../../services/api';
import toast from 'react-hot-toast';
import { EyeIcon, TruckIcon } from '@heroicons/react/24/outline';

const AdminOrders = () => {
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', tracking: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await admin.getAllOrders();
      setOrderList(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId) => {
    try {
      await orders.updateStatus(orderId, statusUpdate.status, statusUpdate.tracking);
      toast.success('Order status updated');
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="p-6 text-center">Loading orders...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Order Management</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orderList.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 font-medium">#{order.id}</td>
                <td className="px-6 py-4">
                  <div>
                    <div>{order.User?.name}</div>
                    <div className="text-sm text-gray-500">{order.User?.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">${order.total_amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Order #{selectedOrder.id} Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Customer Information</h4>
              <p><strong>Name:</strong> {selectedOrder.User?.name}</p>
              <p><strong>Email:</strong> {selectedOrder.User?.email}</p>
              <p><strong>Address:</strong> {selectedOrder.shipping_address}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Order Items</h4>
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
                    <th className="text-left py-2">Quantity</th>
                    <th className="text-left py-2">Price</th>
                    <th className="text-left py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.OrderItems?.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.Product?.name}</td>
                      <td className="py-2">{item.quantity}</td>
                      <td className="py-2">${item.price}</td>
                      <td className="py-2">${item.quantity * item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right mt-3">
                <p className="font-bold">Total: ${selectedOrder.total_amount}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Update Status</h4>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                  className="border rounded px-3 py-2"
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <input
                  type="text"
                  placeholder="Tracking Number"
                  value={statusUpdate.tracking}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, tracking: e.target.value })}
                  className="border rounded px-3 py-2"
                />
              </div>
              <button
                onClick={() => updateOrderStatus(selectedOrder.id)}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
              >
                <TruckIcon className="h-5 w-5 mr-2" />
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
