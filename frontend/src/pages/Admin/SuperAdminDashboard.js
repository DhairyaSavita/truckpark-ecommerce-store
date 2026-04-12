import React, { useState, useEffect } from 'react';
import { admin } from '../../services/api';
import { 
  UsersIcon, 
  ShoppingBagIcon, 
  CubeIcon, 
  TruckIcon,
  WrenchScrewdriverIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalTechnicians: 0,
    totalDrivers: 0,
    totalLogistics: 0,
    totalRefurbishers: 0,
    pendingSellers: 0,
    pendingTechnicians: 0,
    pendingDrivers: 0,
    pendingLogistics: 0,
    pendingRefurbishers: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchStats();
    fetchAllPending();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await admin.getSuperAdminStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPending = async () => {
    try {
      const [sellers, technicians, drivers, logistics, refurbishers] = await Promise.all([
        admin.getPendingSellers(),
        admin.getPendingTechnicians(),
        admin.getPendingDrivers(),
        admin.getPendingLogistics(),
        admin.getPendingRefurbishers()
      ]);
      setStats(prev => ({
        ...prev,
        pendingSellers: sellers.data.length,
        pendingTechnicians: technicians.data.length,
        pendingDrivers: drivers.data.length,
        pendingLogistics: logistics.data.length,
        pendingRefurbishers: refurbishers.data.length
      }));
    } catch (error) {
      console.error('Error fetching pending:', error);
    }
  };

  const approveUser = async (type, id) => {
    try {
      await admin.approveUser(type, id);
      toast.success(`${type} approved successfully`);
      fetchStats();
      setSelectedUser(null);
    } catch (error) {
      toast.error(`Failed to approve ${type}`);
    }
  };

  const rejectUser = async (type, id) => {
    if (!rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await admin.rejectUser(type, id, rejectionReason);
      toast.success(`${type} rejected`);
      fetchStats();
      setSelectedUser(null);
      setRejectionReason('');
    } catch (error) {
      toast.error(`Failed to reject ${type}`);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: UsersIcon, color: 'bg-blue-500', link: '/admin/users' },
    { title: 'Sellers', value: stats.totalSellers, icon: BuildingStorefrontIcon, color: 'bg-green-500', link: '/admin/sellers' },
    { title: 'Technicians', value: stats.totalTechnicians, icon: WrenchScrewdriverIcon, color: 'bg-purple-500', link: '/admin/technicians' },
    { title: 'Drivers', value: stats.totalDrivers, icon: TruckIcon, color: 'bg-orange-500', link: '/admin/drivers' },
    { title: 'Logistics', value: stats.totalLogistics, icon: GlobeAltIcon, color: 'bg-indigo-500', link: '/admin/logistics' },
    { title: 'Refurbishers', value: stats.totalRefurbishers, icon: ArrowPathIcon, color: 'bg-teal-500', link: '/admin/refurbishers' },
  ];

  const pendingCounts = [
    { type: 'Sellers', count: stats.pendingSellers, icon: BuildingStorefrontIcon, color: 'text-green-600' },
    { type: 'Technicians', count: stats.pendingTechnicians, icon: WrenchScrewdriverIcon, color: 'text-purple-600' },
    { type: 'Drivers', count: stats.pendingDrivers, icon: TruckIcon, color: 'text-orange-600' },
    { type: 'Logistics', count: stats.pendingLogistics, icon: GlobeAltIcon, color: 'text-indigo-600' },
    { type: 'Refurbishers', count: stats.pendingRefurbishers, icon: ArrowPathIcon, color: 'text-teal-600' },
  ];

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage all users, applications, and platform activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-2 rounded-full`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Approvals Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Pending Approvals</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {pendingCounts.map((item, index) => (
            <div
              key={index}
              onClick={() => setSelectedTab(item.type.toLowerCase())}
              className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{item.type}</p>
                  <p className="text-2xl font-bold">{item.count}</p>
                </div>
                <item.icon className={`h-8 w-8 ${item.color} opacity-50`} />
              </div>
              {item.count > 0 && (
                <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Awaiting Review
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
          <div className="space-y-3">
            {stats.recentActivities?.length > 0 ? (
              stats.recentActivities.map((activity, index) => (
                <div key={index} className="border-b pb-2">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activities</p>
            )}
          </div>
        </div>

        {/* Platform Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Platform Overview</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Revenue</span>
              <span className="font-bold text-green-600">₹{stats.totalRevenue?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Orders</span>
              <span className="font-bold">{stats.totalOrders || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Products</span>
              <span className="font-bold">{stats.totalProducts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Commission</span>
              <span className="font-bold">{stats.commissionRate || 10}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
