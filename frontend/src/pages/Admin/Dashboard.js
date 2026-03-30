import React, { useState, useEffect } from 'react';
import { admin } from '../../services/api';
import { 
  UsersIcon, 
  ShoppingBagIcon, 
  CubeIcon, 
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
    pendingOrders: 0,
    totalMessages: 0,
    totalRevenue: 0,
    recentOrders: [],
    recentMessages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await admin.getStats();
      console.log('Stats response:', response.data);
      setStats({
        totalUsers: response.data?.totalUsers || 0,
        totalProducts: response.data?.totalProducts || 0,
        totalOrders: response.data?.totalOrders || 0,
        totalCategories: response.data?.totalCategories || 0,
        pendingOrders: response.data?.pendingOrders || 0,
        totalMessages: response.data?.totalMessages || 0,
        totalRevenue: response.data?.totalRevenue || 0,
        recentOrders: response.data?.recentOrders || [],
        recentMessages: response.data?.recentMessages || []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      icon: UsersIcon, 
      color: 'bg-blue-500',
      link: '/admin/users'
    },
    { 
      title: 'Total Products', 
      value: stats.totalProducts, 
      icon: CubeIcon, 
      color: 'bg-green-500',
      link: '/admin/products'
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders, 
      icon: ShoppingBagIcon, 
      color: 'bg-purple-500',
      link: '/admin/orders'
    },
    { 
      title: 'Pending Orders', 
      value: stats.pendingOrders, 
      icon: TruckIcon, 
      color: 'bg-yellow-500',
      link: '/admin/orders?status=pending'
    },
    { 
      title: 'New Messages', 
      value: stats.totalMessages, 
      icon: ChatBubbleLeftRightIcon, 
      color: 'bg-red-500',
      link: '/admin/messages'
    },
    { 
      title: 'Total Revenue', 
      value: `$${stats.totalRevenue.toFixed(2)}`, 
      icon: CurrencyDollarIcon, 
      color: 'bg-indigo-500',
      link: '/admin/orders'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link to={stat.link} key={index}>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="border-b pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">{order.User?.name || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${order.total_amount}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent orders</p>
          )}
          <Link to="/admin/orders" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            View all orders →
          </Link>
        </div>
        
        {/* Recent Messages */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Enquiries</h2>
          {stats.recentMessages && stats.recentMessages.length > 0 ? (
            <div className="space-y-3">
              {stats.recentMessages.map((message) => (
                <div key={message.id} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold">{message.User?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600 truncate">{message.subject || 'No subject'}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(message.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {message.status === 'unread' && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">New</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent enquiries</p>
          )}
          <Link to="/admin/messages" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            View all enquiries →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
