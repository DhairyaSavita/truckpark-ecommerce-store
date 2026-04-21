import React, { useState, useEffect } from 'react';
import { orders } from '../services/api';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  CubeIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon,
  EyeIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

const Orders = () => {
  const location = useLocation();
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchOrders();
    if (location.state?.newOrder) {
      toast.success('Order placed successfully!');
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orders.getMyOrders();
      setOrderList(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', icon: CubeIcon, text: 'Processing' },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: TruckIcon, text: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: CubeIcon, text: 'Cancelled' }
    };
    return config[status] || config.pending;
  };

  const getFilteredOrders = () => {
    if (filter === 'all') return orderList;
    return orderList.filter(order => order.status === filter);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-center py-10">Loading orders...</div>;
  }

  const filteredOrders = getFilteredOrders();
  const statusCounts = {
    all: orderList.length,
    pending: orderList.filter(o => o.status === 'pending').length,
    processing: orderList.filter(o => o.status === 'processing').length,
    shipped: orderList.filter(o => o.status === 'shipped').length,
    delivered: orderList.filter(o => o.status === 'delivered').length,
    cancelled: orderList.filter(o => o.status === 'cancelled').length
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-gray-600 mt-1">Track and manage your orders</p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <ShoppingBagIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
          <a href="/products" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block">
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusBadge(order.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center ${statusConfig.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.text}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="space-y-3">
                    {order.OrderItems?.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.Product?.image_url || 'https://via.placeholder.com/50x50?text=Product'}
                            alt={item.Product?.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-semibold">{item.Product?.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                    {order.OrderItems?.length > 2 && (
                      <p className="text-sm text-gray-500 text-center">
                        + {order.OrderItems.length - 2} more items
                      </p>
                    )}
                  </div>
                  
                  <div className="border-t mt-4 pt-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900">${order.total_amount}</p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                    >
                      <EyeIcon className="h-5 w-5" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Order #{selectedOrder.id} Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-semibold">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-semibold">{selectedOrder.payment_method || 'Cash on Delivery'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Status</p>
                  <p className="font-semibold capitalize">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tracking Number</p>
                  <p className="font-semibold">{selectedOrder.tracking_number || 'Not assigned'}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Shipping Address</h4>
              <p className="text-gray-700">{selectedOrder.shipping_address}</p>
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
                    {selectedOrder.OrderItems?.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 px-3">{item.Product?.name}</td>
                        <td className="py-2 px-3">{item.quantity}</td>
                        <td className="py-2 px-3">${item.price}</td>
                        <td className="py-2 px-3">${(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold">
                      <td colSpan="3" className="text-right py-2 px-3">Total:</td>
                      <td className="py-2 px-3">${selectedOrder.total_amount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
