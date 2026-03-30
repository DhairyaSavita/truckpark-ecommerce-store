import React, { useState, useEffect } from 'react';
import { admin } from '../../services/api';
import { 
  UsersIcon, 
  ShoppingBagIcon, 
  CubeIcon, 
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  TruckIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    pendingSellers: 0,
    recentOrders: [],
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await admin.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      icon: UsersIcon, 
      color: 'bg-blue-500',
      link: '/admin/users'
    },
    { 
      title: 'Total Sellers', 
      value: stats.totalSellers, 
      icon: UserGroupIcon, 
      color: 'bg-green-500',
      link: '/admin/sellers'
    },
    { 
      title: 'Total Products', 
      value: stats.totalProducts, 
      icon: CubeIcon, 
      color: 'bg-purple-500',
      link: '/admin/inventory'
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders, 
      icon: ShoppingBagIcon, 
      color: 'bg-indigo-500',
      link: '/admin/orders'
    },
    { 
      title: 'Pending Orders', 
      value: stats.pendingOrders, 
      icon: ClipboardDocumentListIcon, 
      color: 'bg-orange-500',
      link: '/admin/orders?status=pending'
    },
    { 
      title: 'Total Revenue', 
      value: `$${stats.totalRevenue.toFixed(2)}`, 
      icon: CurrencyDollarIcon, 
      color: 'bg-yellow-500',
      link: '/admin/orders'
    },
    { 
      title: 'Low Stock Items', 
      value: stats.lowStockProducts, 
      icon: TruckIcon, 
      color: 'bg-red-500',
      link: '/admin/inventory?filter=lowstock'
    },
    { 
      title: 'Pending Sellers', 
      value: stats.pendingSellers, 
      icon: ChatBubbleLeftRightIcon, 
      color: 'bg-pink-500',
      link: '/admin/sellers?filter=pending'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage users, sellers, orders, and inventory</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-blue-600 hover:text-blue-800 text-sm">
              View all →
            </Link>
          </div>
          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="border-b pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">{order.User?.name || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${parseFloat(order.total_amount).toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent orders</p>
          )}
        </div>
        
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Users</h2>
            <Link to="/admin/users" className="text-blue-600 hover:text-blue-800 text-sm">
              View all →
            </Link>
          </div>
          {stats.recentUsers && stats.recentUsers.length > 0 ? (
            <div className="space-y-3">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="border-b pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'seller' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent users</p>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/users" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
            <UsersIcon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <span className="text-sm">Manage Users</span>
          </Link>
          <Link to="/admin/inventory" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
            <CubeIcon className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <span className="text-sm">Manage Products</span>
          </Link>
          <Link to="/admin/orders" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
            <ShoppingBagIcon className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <span className="text-sm">View Orders</span>
          </Link>
          <Link to="/admin/sellers" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
            <UserGroupIcon className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <span className="text-sm">Manage Sellers</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
