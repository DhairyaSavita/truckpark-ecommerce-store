import React, { useState, useEffect } from 'react';
import { admin, orders } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  EyeIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AdminOrders = () => {
  const [orderList, setOrderList] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusUpdate, setStatusUpdate] = useState({ status: '', tracking: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orderList]);

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

  const filterOrders = () => {
    let filtered = [...orderList];
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchTerm) ||
        order.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.User?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId) => {
    try {
      await orders.updateStatus(orderId, statusUpdate.status, statusUpdate.tracking);
      toast.success('Order status updated');
      fetchOrders();
      setSelectedOrder(null);
      setStatusUpdate({ status: '', tracking: '' });
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

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'cancelled': return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'shipped': return <TruckIcon className="h-5 w-5 text-purple-600" />;
      default: return <ClockIcon className="h-5 w-5 text-yellow-600" />;
    }
  };

  const exportOrders = () => {
    if (filteredOrders.length === 0) {
      toast.error('No orders to export');
      return;
    }
    
    const headers = ['Order ID', 'Customer', 'Email', 'Total', 'Status', 'Date'];
    const csvData = filteredOrders.map(order => [
      order.id,
      order.User?.name || 'N/A',
      order.User?.email || 'N/A',
      order.total_amount,
      order.status,
      new Date(order.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Orders exported successfully');
  };

  if (loading) {
    return <div className="text-center py-10">Loading orders...</div>;
  }

  const statusCounts = {
    all: orderList.length,
    pending: orderList.filter(o => o.status === 'pending').length,
    processing: orderList.filter(o => o.status === 'processing').length,
    shipped: orderList.filter(o => o.status === 'shipped').length,
    delivered: orderList.filter(o => o.status === 'delivered').length,
    cancelled: orderList.filter(o => o.status === 'cancelled').length
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <button
          onClick={exportOrders}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          Export Orders
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`bg-white rounded-lg shadow-md p-3 text-center hover:shadow-lg transition ${
              statusFilter === status ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-sm text-gray-600 capitalize">{status}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 font-medium">#{order.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div>{order.User?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{order.User?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold">${parseFloat(order.total_amount).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Order #{selectedOrder.id} Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>Name:</strong> {selectedOrder.User?.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedOrder.User?.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedOrder.User?.phone || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedOrder.shipping_address || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Order Information</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                  <p><strong>Payment Method:</strong> {selectedOrder.payment_method || 'Cash on Delivery'}</p>
                  <p><strong>Payment Status:</strong> {selectedOrder.payment_status || 'pending'}</p>
                  <p><strong>Tracking Number:</strong> {selectedOrder.tracking_number || 'Not assigned'}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Order Items</h4>
              <div className="bg-gray-50 rounded overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Product</th>
                      <th className="text-left py-2 px-3">Quantity</th>
                      <th className="text-left py-2 px-3">Price</th>
                      <th className="text-left py-2 px-3">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.OrderItems?.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-3">{item.Product?.name || 'Unknown Product'}</td>
                        <td className="py-2 px-3">{item.quantity}</td>
                        <td className="py-2 px-3">${parseFloat(item.price).toFixed(2)}</td>
                        <td className="py-2 px-3">${(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold">
                      <td colSpan="3" className="text-right py-2 px-3">Total:</td>
                      <td className="py-2 px-3">${parseFloat(selectedOrder.total_amount).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
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
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              >
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
