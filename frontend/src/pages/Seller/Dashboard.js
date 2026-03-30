import React, { useState, useEffect } from 'react';
import { sellerAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  CubeIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalEarnings: 0,
    pendingEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [products, orders, earnings] = await Promise.all([
        sellerAPI.getProducts(),
        sellerAPI.getOrders(),
        sellerAPI.getEarnings()
      ]);
      
      setStats({
        totalProducts: products.data?.length || 0,
        totalOrders: orders.data?.length || 0,
        totalEarnings: earnings.data?.totalEarnings || 0,
        pendingEarnings: earnings.data?.pendingEarnings || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: CubeIcon,
      color: 'bg-blue-500',
      link: '/seller/products'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBagIcon,
      color: 'bg-green-500',
      link: '/seller/orders'
    },
    {
      title: 'Total Earnings',
      value: `$${stats.totalEarnings.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
      link: '/seller/earnings'
    },
    {
      title: 'Pending Payout',
      value: `$${stats.pendingEarnings.toFixed(2)}`,
      icon: ChartBarIcon,
      color: 'bg-yellow-500',
      link: '/seller/earnings'
    }
  ];

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.store_name || user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link to={stat.link} key={index}>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/seller/products/new"
              className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Add New Product
            </Link>
            <Link
              to="/seller/products"
              className="block w-full text-center bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
            >
              Manage Products
            </Link>
            <Link
              to="/seller/orders"
              className="block w-full text-center bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              View Orders
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Store Performance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Store Rating</span>
                <span>{user?.store_rating || 0} / 5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 rounded-full h-2"
                  style={{ width: `${(user?.store_rating || 0) * 20}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Total Sales</span>
                <span>{user?.total_sales || 0} orders</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Commission Rate</span>
                <span>{user?.commission_rate || 10}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
