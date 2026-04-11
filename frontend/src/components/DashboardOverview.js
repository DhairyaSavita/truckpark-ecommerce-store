import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  CubeIcon, 
  UsersIcon,
  TicketIcon,
  HeartIcon,
  BellIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const DashboardOverview = () => {
  const { user } = useAuth();

  const userModules = [
    { to: '/orders', label: 'My Orders', icon: ShoppingBagIcon, color: 'bg-blue-500' },
    { to: '/wishlist', label: 'Wishlist', icon: HeartIcon, color: 'bg-red-500' },
    { to: '/price-alerts', label: 'Price Alerts', icon: BellIcon, color: 'bg-yellow-500' },
    { to: '/support/tickets', label: 'Support', icon: TicketIcon, color: 'bg-purple-500' },
  ];

  const sellerModules = [
    { to: '/seller', label: 'Seller Dashboard', icon: ChartBarIcon, color: 'bg-green-500' },
    { to: '/seller/products', label: 'Manage Products', icon: CubeIcon, color: 'bg-indigo-500' },
    { to: '/seller/orders', label: 'Seller Orders', icon: ShoppingBagIcon, color: 'bg-orange-500' },
    { to: '/seller/earnings', label: 'Earnings', icon: DocumentTextIcon, color: 'bg-teal-500' },
  ];

  const adminModules = [
    { to: '/admin', label: 'Admin Dashboard', icon: ChartBarIcon, color: 'bg-gray-700' },
    { to: '/admin/users', label: 'User Management', icon: UsersIcon, color: 'bg-blue-600' },
    { to: '/admin/products', label: 'Product Management', icon: CubeIcon, color: 'bg-green-600' },
    { to: '/admin/orders', label: 'Order Management', icon: ShoppingBagIcon, color: 'bg-purple-600' },
    { to: '/admin/sellers', label: 'Seller Management', icon: BuildingStorefrontIcon, color: 'bg-orange-600' },
    { to: '/admin/support-tickets', label: 'Support Tickets', icon: TicketIcon, color: 'bg-red-600' },
    { to: '/admin/inventory', label: 'Inventory', icon: CubeIcon, color: 'bg-teal-600' },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container-custom py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your account</p>
        </motion.div>

        {/* User Modules */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userModules.map((module) => (
              <Link
                key={module.to}
                to={module.to}
                className="bg-white rounded-xl p-4 text-center hover:shadow-lg transition-shadow"
              >
                <div className={`${module.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <module.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{module.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Seller Modules */}
        {(user?.role === 'seller' || user?.role === 'admin') && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold mb-4">Seller Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sellerModules.map((module) => (
                <Link
                  key={module.to}
                  to={module.to}
                  className="bg-white rounded-xl p-4 text-center hover:shadow-lg transition-shadow"
                >
                  <div className={`${module.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <module.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{module.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Admin Modules */}
        {user?.role === 'admin' && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold mb-4">Administration</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {adminModules.map((module) => (
                <Link
                  key={module.to}
                  to={module.to}
                  className="bg-white rounded-xl p-4 text-center hover:shadow-lg transition-shadow"
                >
                  <div className={`${module.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <module.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{module.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Feature Spotlight */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold mb-1">Need installation service?</h3>
              <p className="text-primary-100">Book certified mechanics for professional installation</p>
            </div>
            <Link to="/installations" className="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
              Book Now →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardOverview;
