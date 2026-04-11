import React, { useState, useEffect } from 'react';
import { vendorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBagIcon,
  CurrencyRupeeIcon,
  CubeIcon,
  ChartBarIcon,
  TruckIcon,
  StarIcon,
  DocumentArrowDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    stats: { totalProducts: 0, totalOrders: 0, totalRevenue: 0, lowStock: 0, averageOrderValue: 0 },
    monthlySales: [],
    topProducts: [],
    recentProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [csvData, setCsvData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await vendorAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await vendorAPI.bulkUpload(formData);
      toast.success('Products uploaded successfully');
      setShowBulkUpload(false);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to upload products');
    }
  };

  const statCards = [
    { title: 'Total Products', value: stats.stats.totalProducts, icon: CubeIcon, color: 'bg-blue-500' },
    { title: 'Total Orders', value: stats.stats.totalOrders, icon: ShoppingBagIcon, color: 'bg-green-500' },
    { title: 'Total Revenue', value: `₹${stats.stats.totalRevenue.toLocaleString()}`, icon: CurrencyRupeeIcon, color: 'bg-purple-500' },
    { title: 'Low Stock Items', value: stats.stats.lowStock, icon: TruckIcon, color: 'bg-red-500' },
    { title: 'Avg Order Value', value: `₹${stats.stats.averageOrderValue.toLocaleString()}`, icon: ChartBarIcon, color: 'bg-orange-500' },
    { title: 'Seller Rating', value: user?.store_rating || 'New', icon: StarIcon, color: 'bg-yellow-500' }
  ];

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.store_name || user?.name}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowBulkUpload(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Bulk Upload
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">{stat.title}</p>
                <p className="text-xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-2 rounded-full`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Sales Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Monthly Sales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Top Selling Products</h2>
          <div className="space-y-3">
            {stats.topProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} units sold</p>
                </div>
                <span className="text-blue-600 font-bold">#{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Product Name</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Stock</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentProducts.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">₹{product.price}</td>
                  <td className="px-4 py-2">{product.stock_quantity}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.stock_quantity > 10 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.stock_quantity > 10 ? 'In Stock' : 'Low Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Bulk Upload Products</h3>
              <button onClick={() => setShowBulkUpload(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Upload CSV file with product details</p>
              <a href="/sample-products.csv" className="text-blue-600 text-sm hover:underline">Download Sample CSV</a>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleBulkUpload}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
