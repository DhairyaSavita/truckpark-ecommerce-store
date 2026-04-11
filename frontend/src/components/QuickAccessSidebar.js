import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  ShoppingBagIcon,
  HeartIcon,
  BellIcon,
  TicketIcon,
  CubeIcon,
  ChartBarIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  UserCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const QuickAccessSidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: HomeIcon, roles: ['user', 'seller', 'admin'] },
    { to: '/products', label: 'Browse Products', icon: CubeIcon, roles: ['user', 'seller', 'admin'] },
    { to: '/orders', label: 'My Orders', icon: ShoppingBagIcon, roles: ['user', 'seller', 'admin'] },
    { to: '/wishlist', label: 'Wishlist', icon: HeartIcon, roles: ['user', 'seller', 'admin'] },
    { to: '/price-alerts', label: 'Price Alerts', icon: BellIcon, roles: ['user', 'seller', 'admin'] },
    { to: '/support/tickets', label: 'Support', icon: TicketIcon, roles: ['user', 'seller', 'admin'] },
    { to: '/seller', label: 'Seller Dashboard', icon: ChartBarIcon, roles: ['seller', 'admin'] },
    { to: '/admin', label: 'Admin Panel', icon: UsersIcon, roles: ['admin'] },
    { to: '/installations', label: 'Installation', icon: TruckIcon, roles: ['user', 'seller', 'admin'] },
    { to: '/profile', label: 'Profile', icon: UserCircleIcon, roles: ['user', 'seller', 'admin'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="w-64 bg-white border-r min-h-screen p-4 hidden lg:block">
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Navigation</h3>
      </div>
      <nav className="space-y-1">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default QuickAccessSidebar;
