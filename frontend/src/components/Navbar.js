import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingCartIcon, 
  UserIcon,
  ChartBarIcon,
  UsersIcon,
  CubeIcon,
  ShoppingBagIcon,
  EnvelopeIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  HeartIcon,
  BellIcon,
  TicketIcon,
  WrenchScrewdriverIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold">
            Mystery Auto Parts
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/products" className="hover:text-gray-300">
              Products
            </Link>
            
            <Link to="/contact" className="hover:text-gray-300">
              Contact
            </Link>
            
            {/* Features Dropdown */}
            <div className="relative group">
              <button className="hover:text-gray-300 flex items-center space-x-1">
                <span>Features</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="absolute right-0 mt-2 w-64 bg-white text-gray-900 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-semibold">Marketplace Features</p>
                  </div>
                  <Link to="/wishlist" className="flex items-center px-4 py-2 hover:bg-gray-100">
                    <HeartIcon className="h-5 w-5 mr-3 text-red-500" />
                    <span>Wishlist & Price Alerts</span>
                  </Link>
                  <Link to="/support/tickets" className="flex items-center px-4 py-2 hover:bg-gray-100">
                    <TicketIcon className="h-5 w-5 mr-3 text-blue-500" />
                    <span>Support Tickets</span>
                  </Link>
                  <Link to="/compatibility" className="flex items-center px-4 py-2 hover:bg-gray-100">
                    <WrenchScrewdriverIcon className="h-5 w-5 mr-3 text-green-500" />
                    <span>Vehicle Compatibility</span>
                  </Link>
                  <Link to="/b2b/quotes" className="flex items-center px-4 py-2 hover:bg-gray-100">
                    <BuildingStorefrontIcon className="h-5 w-5 mr-3 text-purple-500" />
                    <span>B2B Quotes</span>
                  </Link>
                  <Link to="/installations" className="flex items-center px-4 py-2 hover:bg-gray-100">
                    <TruckIcon className="h-5 w-5 mr-3 text-orange-500" />
                    <span>Installation Booking</span>
                  </Link>
                </div>
              </div>
            </div>
            
            {user && (
              <>
                <Link to="/cart" className="relative hover:text-gray-300">
                  <ShoppingCartIcon className="h-6 w-6" />
                </Link>
                
                {/* Seller Hub Dropdown */}
                {(user.role === 'seller' || user.role === 'admin') && (
                  <div className="relative group">
                    <button className="hover:text-gray-300 flex items-center space-x-1">
                      <BuildingStorefrontIcon className="h-5 w-5" />
                      <span>Seller Hub</span>
                    </button>
                    
                    <div className="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-semibold">Seller Dashboard</p>
                        </div>
                        <Link to="/seller" className="flex items-center px-4 py-2 hover:bg-gray-100">
                          <ChartBarIcon className="h-5 w-5 mr-3 text-gray-500" />
                          <span>Dashboard</span>
                        </Link>
                        <Link to="/seller/products" className="flex items-center px-4 py-2 hover:bg-gray-100">
                          <CubeIcon className="h-5 w-5 mr-3 text-gray-500" />
                          <span>My Products</span>
                        </Link>
                        <Link to="/seller/orders" className="flex items-center px-4 py-2 hover:bg-gray-100">
                          <ShoppingBagIcon className="h-5 w-5 mr-3 text-gray-500" />
                          <span>My Orders</span>
                        </Link>
                        <Link to="/seller/earnings" className="flex items-center px-4 py-2 hover:bg-gray-100">
                          <CurrencyDollarIcon className="h-5 w-5 mr-3 text-gray-500" />
                          <span>Earnings</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Admin Dropdown */}
                {user.role === 'admin' && (
                  <div className="relative group">
                    <button className="hover:text-gray-300 flex items-center space-x-1">
                      <span>Admin Panel</span>
                    </button>
                    
                    <div className="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-semibold">Admin Menu</p>
                        </div>
                        <Link to="/admin" className="flex items-center px-4 py-2 hover:bg-gray-100">
                          <ChartBarIcon className="h-5 w-5 mr-3 text-gray-500" />
                          <span>Dashboard</span>
                        </Link>
                        <Link to="/admin/users" className="flex items-center px-4 py-2 hover:bg-gray-100">
                          <UsersIcon className="h-5 w-5 mr-3 text-gray-500" />
                          <span>User Management</span>
                        </Link>
                        <Link to="/admin/products" className="flex items-center px-4 py-2 hover:bg-gray-100">
                          <CubeIcon className="h-5 w-5 mr-3 text-gray-500" />
                          <span>Products</span>
                        </Link>
                        <Link to="/admin/orders" className="flex items-center px-4 py-2 hover:bg-gray-100">
                          <ShoppingBagIcon className="h-5 w-5 mr-3 text-gray-500" />
                          <span>Orders</span>
                        </Link>
                        <Link to="/admin/messages" className="flex items-center px-4 py-2 hover:bg-gray-100">
                          <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-500" />
                          <span>Enquiries</span>
                        </Link>
                        <Link to="/admin/sellers" className="flex items-center px-4 py-2 hover:bg-gray-100">
                          <BuildingStorefrontIcon className="h-5 w-5 mr-3 text-gray-500" />
                          <span>Seller Applications</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* User Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 hover:text-gray-300">
                    <UserIcon className="h-6 w-6" />
                    <span>{user.name}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link to="/orders" className="flex items-center px-4 py-2 hover:bg-gray-100">
                        <ShoppingBagIcon className="h-5 w-5 mr-3 text-gray-500" />
                        <span>My Orders</span>
                      </Link>
                      <Link to="/wishlist" className="flex items-center px-4 py-2 hover:bg-gray-100">
                        <HeartIcon className="h-5 w-5 mr-3 text-red-500" />
                        <span>My Wishlist</span>
                      </Link>
                      <Link to="/price-alerts" className="flex items-center px-4 py-2 hover:bg-gray-100">
                        <BellIcon className="h-5 w-5 mr-3 text-yellow-500" />
                        <span>Price Alerts</span>
                      </Link>
                      <Link to="/support/tickets" className="flex items-center px-4 py-2 hover:bg-gray-100">
                        <TicketIcon className="h-5 w-5 mr-3 text-blue-500" />
                        <span>Support Tickets</span>
                      </Link>
                      {user.role === 'user' && (
                        <Link to="/become-seller" className="flex items-center px-4 py-2 hover:bg-gray-100">
                          <BuildingStorefrontIcon className="h-5 w-5 mr-3 text-gray-500" />
                          <span>Become a Seller</span>
                        </Link>
                      )}
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                        >
                          <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {!user && (
              <>
                <Link to="/login" className="hover:text-gray-300">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
                  Register
                </Link>
                <Link to="/wishlist" className="flex items-center px-4 py-2 hover:bg-gray-100">
                <HeartIcon className="h-5 w-5 mr-3 text-red-500" />
                <span>My Wishlist</span>
                </Link>
                <Link to="/admin/support-tickets" className="flex items-center px-4 py-2 hover:bg-gray-100">
                <TicketIcon className="h-5 w-5 mr-3 text-purple-500" />
                <span>Support Tickets</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
