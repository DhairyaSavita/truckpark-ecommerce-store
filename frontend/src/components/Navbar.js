import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle, { ThemeToggleSwitch } from './ThemeToggle';
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
  TruckIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
    setIsOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: HomeIcon },
    { to: '/products', label: 'Products', icon: CubeIcon },
    { to: '/contact', label: 'Contact', icon: PhoneIcon },
  ];

  const featureLinks = [
    { to: '/wishlist', label: 'Wishlist', icon: HeartIcon, color: 'text-red-500' },
    { to: '/price-alerts', label: 'Price Alerts', icon: BellIcon, color: 'text-yellow-500' },
    { to: '/support/tickets', label: 'Support Tickets', icon: TicketIcon, color: 'text-blue-500' },
    { to: '/compatibility', label: 'Compatibility Check', icon: ShieldCheckIcon, color: 'text-green-500' },
    { to: '/b2b/quotes', label: 'B2B Quotes', icon: DocumentTextIcon, color: 'text-purple-500' },
    { to: '/installations', label: 'Installation Booking', icon: TruckIcon, color: 'text-orange-500' },
    { to: '/forum', label: 'Community Forum', icon: ChatBubbleLeftRightIcon, color: 'text-indigo-500' },
    { to: '/auctions', label: 'Live Auctions', icon: GiftIcon, color: 'text-pink-500' },
    { to: '/refurbished-parts', label: 'Refurbished Parts', icon: ArrowPathIcon, color: 'text-green-600' },
  ];

  const mobileMenuVariants = {
    hidden: { opacity: 0, x: '100%' },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '100%' }
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg backdrop-blur-sm bg-opacity-95' : 'bg-gradient-to-r from-gray-900 to-gray-800'}`}>
        <div className="container-custom">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <span className={`text-2xl font-bold ${scrolled ? 'text-primary-600' : 'text-white'}`}>
                  TruckParts
                </span>
                <span className={`text-xl font-semibold ${scrolled ? 'text-gray-700' : 'text-gray-300'}`}>
                  Market
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              ))}

              {/* Features Dropdown */}
              <div className="relative group">
                <button className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
                  scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 hover:bg-white hover:bg-opacity-10'
                }`}>
                  <span>Features</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-semibold text-gray-700">All Features</p>
                    </div>
                    {featureLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 transition"
                      >
                        <link.icon className={`h-5 w-5 mr-3 ${link.color}`} />
                        <span className="text-gray-700">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {user && (
                <>
                  <Link to="/cart" className={`relative p-2 rounded-lg ${
                    scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 hover:bg-white hover:bg-opacity-10'
                  }`}>
                    <ShoppingCartIcon className="h-5 w-5" />
                  </Link>

                  {/* Refurbisher Hub Dropdown */}
                  {(user.is_refurbisher || user.role === 'admin') && (
                    <div className="relative group">
                      <button className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
                        scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 hover:bg-white hover:bg-opacity-10'
                      }`}>
                        <ArrowPathIcon className="h-5 w-5" />
                        <span>Refurbisher Hub</span>
                      </button>
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-2">
                          <Link to="/refurbisher/dashboard" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <ChartBarIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Dashboard</span>
                          </Link>
                          <Link to="/refurbisher/products" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <CubeIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>My Products</span>
                          </Link>
                          <Link to="/refurbisher/auctions" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <GiftIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>My Auctions</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Technician Hub Dropdown */}
                  {(user.is_technician || user.role === 'admin') && (
                    <div className="relative group">
                      <button className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
                        scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 hover:bg-white hover:bg-opacity-10'
                      }`}>
                        <WrenchScrewdriverIcon className="h-5 w-5" />
                        <span>Tech Hub</span>
                      </button>
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-2">
                          <Link to="/technician/dashboard" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <ChartBarIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Dashboard</span>
                          </Link>
                          <Link to="/technician/requests" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <TicketIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Service Requests</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Driver Hub Dropdown */}
                  {(user.is_driver || user.role === 'admin') && (
                    <div className="relative group">
                      <button className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
                        scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 hover:bg-white hover:bg-opacity-10'
                      }`}>
                        <TruckIcon className="h-5 w-5" />
                        <span>Driver Hub</span>
                      </button>
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-2">
                          <Link to="/driver/dashboard" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <ChartBarIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Dashboard</span>
                          </Link>
                          <Link to="/driver/trips" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <ShoppingBagIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>My Trips</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Logistics Hub Dropdown */}
                  {(user.is_logistics || user.role === 'admin') && (
                    <div className="relative group">
                      <button className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
                        scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 hover:bg-white hover:bg-opacity-10'
                      }`}>
                        <GlobeAltIcon className="h-5 w-5" />
                        <span>Logistics Hub</span>
                      </button>
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-2">
                          <Link to="/logistics/dashboard" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <ChartBarIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Dashboard</span>
                          </Link>
                          <Link to="/logistics/shipments" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <ShoppingBagIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>My Shipments</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Seller Hub Dropdown */}
                  {(user.role === 'seller' || user.role === 'admin') && (
                    <div className="relative group">
                      <button className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
                        scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 hover:bg-white hover:bg-opacity-10'
                      }`}>
                        <BuildingStorefrontIcon className="h-5 w-5" />
                        <span>Seller Hub</span>
                      </button>
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-2">
                          <Link to="/seller" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <ChartBarIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Dashboard</span>
                          </Link>
                          <Link to="/seller/products" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <CubeIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>My Products</span>
                          </Link>
                          <Link to="/seller/orders" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <ShoppingBagIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>My Orders</span>
                          </Link>
                          <Link to="/seller/earnings" className="flex items-center px-4 py-2 hover:bg-gray-50">
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
                      <button className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
                        scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 hover:bg-white hover:bg-opacity-10'
                      }`}>
                        <ShieldCheckIcon className="h-5 w-5" />
                        <span>Admin</span>
                      </button>
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-2">
                          <Link to="/admin" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <ChartBarIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Dashboard</span>
                          </Link>
                          <Link to="/admin/users" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <UsersIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>User Management</span>
                          </Link>
                          <Link to="/admin/products" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <CubeIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Products</span>
                          </Link>
                          <Link to="/admin/orders" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <ShoppingBagIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Orders</span>
                          </Link>
                          <Link to="/admin/sellers" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <BuildingStorefrontIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Sellers</span>
                          </Link>
                          <Link to="/admin/technicians" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <WrenchScrewdriverIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Technicians</span>
                          </Link>
                          <Link to="/admin/drivers" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <TruckIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Drivers</span>
                          </Link>
                          <Link to="/admin/logistics" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <GlobeAltIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Logistics</span>
                          </Link>
                          <Link to="/admin/refurbishers" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <ArrowPathIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Refurbishers</span>
                          </Link>
                          <Link to="/admin/support-tickets" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <TicketIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Support Tickets</span>
                          </Link>
                          <Link to="/admin/inventory" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <CubeIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Inventory</span>
                          </Link>
                          <Link to="/admin/super" className="flex items-center px-4 py-2 hover:bg-gray-50">
                          <ShieldCheckIcon className="h-5 w-5 mr-3 text-purple-500" />
                          <span>Super Admin</span>
                          </Link>
                          <Link to="/admin/messages" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Messages</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* User Dropdown */}
                  <div className="relative group">
                    <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                      scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 hover:bg-white hover:bg-opacity-10'
                    }`}>
                      <UserIcon className="h-5 w-5" />
                      <span>{user.name?.split(' ')[0]}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        <div className="px-4 py-3 border-b">
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <Link to="/profile" className="flex items-center px-4 py-2 hover:bg-gray-50">
                          <UserCircleIcon className="h-5 w-5 mr-3 text-gray-500" />
                          <span>Profile Settings</span>
                        </Link>
                        <Link to="/orders" className="flex items-center px-4 py-2 hover:bg-gray-50">
                          <ShoppingBagIcon className="h-5 w-5 mr-3 text-gray-500" />
                          <span>My Orders</span>
                        </Link>
                        <Link to="/wishlist" className="flex items-center px-4 py-2 hover:bg-gray-50">
                          <HeartIcon className="h-5 w-5 mr-3 text-red-500" />
                          <span>My Wishlist</span>
                        </Link>
                        <Link to="/price-alerts" className="flex items-center px-4 py-2 hover:bg-gray-50">
                          <BellIcon className="h-5 w-5 mr-3 text-yellow-500" />
                          <span>Price Alerts</span>
                        </Link>
                        <Link to="/support/tickets" className="flex items-center px-4 py-2 hover:bg-gray-50">
                          <TicketIcon className="h-5 w-5 mr-3 text-blue-500" />
                          <span>Support Tickets</span>
                        </Link>
                        
                        {/* Become Options for Regular Users */}
                        {user.role === 'user' && (
                          <>
                            <Link to="/become-seller" className="flex items-center px-4 py-2 hover:bg-gray-50">
                              <BuildingStorefrontIcon className="h-5 w-5 mr-3 text-gray-500" />
                              <span>Become a Seller</span>
                            </Link>
                            <Link to="/become-technician" className="flex items-center px-4 py-2 hover:bg-gray-50">
                              <WrenchScrewdriverIcon className="h-5 w-5 mr-3 text-gray-500" />
                              <span>Become a Technician</span>
                            </Link>
                            <Link to="/become-driver" className="flex items-center px-4 py-2 hover:bg-gray-50">
                              <TruckIcon className="h-5 w-5 mr-3 text-gray-500" />
                              <span>Become a Driver</span>
                            </Link>
                            <Link to="/become-logistics" className="flex items-center px-4 py-2 hover:bg-gray-50">
                              <GlobeAltIcon className="h-5 w-5 mr-3 text-gray-500" />
                              <span>Register Logistics Company</span>
                            </Link>
                            <Link to="/become-refurbisher" className="flex items-center px-4 py-2 hover:bg-gray-50">
                              <ArrowPathIcon className="h-5 w-5 mr-3 text-gray-500" />
                              <span>Become a Refurbisher</span>
                            </Link>
                          </>
                        )}
                        
                        {/* Role-specific Dashboard Links */}
                        {user.is_refurbisher && (
                          <Link to="/refurbisher/dashboard" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <ArrowPathIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Refurbisher Dashboard</span>
                          </Link>
                        )}
                        
                        {user.is_technician && (
                          <Link to="/technician/dashboard" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <WrenchScrewdriverIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Technician Dashboard</span>
                          </Link>
                        )}
                        
                        {user.is_driver && (
                          <Link to="/driver/dashboard" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <TruckIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Driver Dashboard</span>
                          </Link>
                        )}
                        
                        {user.is_logistics && (
                          <Link to="/logistics/dashboard" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <GlobeAltIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Logistics Dashboard</span>
                          </Link>
                        )}
                        
                        {(user.role === 'seller' || user.role === 'admin') && (
                          <Link to="/seller" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <BuildingStorefrontIcon className="h-5 w-5 mr-3 text-gray-500" />
                            <span>Seller Dashboard</span>
                          </Link>
                        )}
                        
                        {/* Marketplace Features */}
                        <div className="border-t mt-2 pt-2">
                          <p className="text-xs font-semibold text-gray-400 px-4 py-1">Marketplace</p>
                          <Link to="/auctions" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <GiftIcon className="h-5 w-5 mr-3 text-purple-500" />
                            <span>Live Auctions</span>
                          </Link>
                          <Link to="/refurbished-parts" className="flex items-center px-4 py-2 hover:bg-gray-50">
                            <ArrowPathIcon className="h-5 w-5 mr-3 text-green-500" />
                            <span>Refurbished Parts</span>
                          </Link>
                        </div>
                        
                        <div className="border-t mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
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

              {/* ── Theme Toggle (always visible in desktop nav) ── */}
              <ThemeToggle />

              {!user && (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className={`px-4 py-2 rounded-lg transition-all ${
                    scrolled ? 'text-primary-600 hover:bg-primary-50' : 'text-white hover:bg-white hover:bg-opacity-10'
                  }`}>
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-2 rounded-lg ${scrolled ? 'text-gray-700' : 'text-white'}`}
            >
              {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white pt-16 overflow-y-auto lg:hidden"
          >
            <div className="p-4 space-y-3">
              {/* Theme Toggle — mobile */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', marginBottom: 4 }}>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Appearance</span>
                <ThemeToggleSwitch />
              </div>
              {/* Main Navigation */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">Main</p>
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <link.icon className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-800">{link.label}</span>
                  </Link>
                ))}
              </div>

              {/* Features */}
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Features</p>
                {featureLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <link.icon className={`h-5 w-5 ${link.color}`} />
                    <span className="text-gray-800">{link.label}</span>
                  </Link>
                ))}
              </div>

              {user && (
                <>
                  {/* Refurbisher Hub */}
                  {(user.is_refurbisher || user.role === 'admin') && (
                    <div className="border-t pt-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Refurbisher Hub</p>
                      <Link to="/refurbisher/dashboard" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <ArrowPathIcon className="h-5 w-5 text-gray-600" />
                        <span>Dashboard</span>
                      </Link>
                      <Link to="/refurbisher/products" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <CubeIcon className="h-5 w-5 text-gray-600" />
                        <span>My Products</span>
                      </Link>
                    </div>
                  )}

                  {/* Technician Hub */}
                  {(user.is_technician || user.role === 'admin') && (
                    <div className="border-t pt-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Technician Hub</p>
                      <Link to="/technician/dashboard" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <WrenchScrewdriverIcon className="h-5 w-5 text-gray-600" />
                        <span>Dashboard</span>
                      </Link>
                    </div>
                  )}

                  {/* Driver Hub */}
                  {(user.is_driver || user.role === 'admin') && (
                    <div className="border-t pt-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Driver Hub</p>
                      <Link to="/driver/dashboard" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <TruckIcon className="h-5 w-5 text-gray-600" />
                        <span>Dashboard</span>
                      </Link>
                    </div>
                  )}

                  {/* Logistics Hub */}
                  {(user.is_logistics || user.role === 'admin') && (
                    <div className="border-t pt-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Logistics Hub</p>
                      <Link to="/logistics/dashboard" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <GlobeAltIcon className="h-5 w-5 text-gray-600" />
                        <span>Dashboard</span>
                      </Link>
                    </div>
                  )}

                  {/* Seller Hub */}
                  {(user.role === 'seller' || user.role === 'admin') && (
                    <div className="border-t pt-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Seller Hub</p>
                      <Link to="/seller" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <BuildingStorefrontIcon className="h-5 w-5 text-gray-600" />
                        <span>Dashboard</span>
                      </Link>
                      <Link to="/seller/products" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <CubeIcon className="h-5 w-5 text-gray-600" />
                        <span>My Products</span>
                      </Link>
                    </div>
                  )}

                  {/* Admin Panel */}
                  {user.role === 'admin' && (
                    <div className="border-t pt-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Admin Panel</p>
                      <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <ChartBarIcon className="h-5 w-5 text-gray-600" />
                        <span>Dashboard</span>
                      </Link>
                      <Link to="/admin/users" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <UsersIcon className="h-5 w-5 text-gray-600" />
                        <span>Users</span>
                      </Link>
                      <Link to="/admin/technicians" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <WrenchScrewdriverIcon className="h-5 w-5 text-gray-600" />
                        <span>Technicians</span>
                      </Link>
                      <Link to="/admin/drivers" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <TruckIcon className="h-5 w-5 text-gray-600" />
                        <span>Drivers</span>
                      </Link>
                      <Link to="/admin/logistics" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <GlobeAltIcon className="h-5 w-5 text-gray-600" />
                        <span>Logistics</span>
                      </Link>
                      <Link to="/admin/refurbishers" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <ArrowPathIcon className="h-5 w-5 text-gray-600" />
                        <span>Refurbishers</span>
                      </Link>
                    </div>
                  )}

                  {/* User Menu */}
                  <div className="border-t pt-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Account</p>
                    <Link to="/cart" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <ShoppingCartIcon className="h-5 w-5 text-gray-600" />
                      <span>Cart</span>
                    </Link>
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <UserCircleIcon className="h-5 w-5 text-gray-600" />
                      <span>Profile</span>
                    </Link>
                    <Link to="/orders" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <ShoppingBagIcon className="h-5 w-5 text-gray-600" />
                      <span>Orders</span>
                    </Link>
                    
                    {/* Become Options for Regular Users */}
                    {user.role === 'user' && (
                      <>
                        <Link to="/become-seller" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                          <BuildingStorefrontIcon className="h-5 w-5 text-gray-600" />
                          <span>Become a Seller</span>
                        </Link>
                        <Link to="/become-technician" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                          <WrenchScrewdriverIcon className="h-5 w-5 text-gray-600" />
                          <span>Become a Technician</span>
                        </Link>
                        <Link to="/become-driver" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                          <TruckIcon className="h-5 w-5 text-gray-600" />
                          <span>Become a Driver</span>
                        </Link>
                        <Link to="/become-logistics" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                          <GlobeAltIcon className="h-5 w-5 text-gray-600" />
                          <span>Register Logistics Company</span>
                        </Link>
                        <Link to="/become-refurbisher" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                          <ArrowPathIcon className="h-5 w-5 text-gray-600" />
                          <span>Become a Refurbisher</span>
                        </Link>
                      </>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full text-left p-3 rounded-lg hover:bg-gray-50 text-red-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}

              {!user && (
                <div className="border-t pt-3 space-y-2">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center p-3 rounded-lg bg-primary-600 text-white">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="block w-full text-center p-3 rounded-lg border-2 border-primary-600 text-primary-600">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
