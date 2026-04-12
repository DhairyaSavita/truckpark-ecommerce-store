import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';

// ─────────────────────────────────────────────────────────────────────────────
// Lazy-loaded pages — each page is split into its own chunk so the browser only
// downloads what the user actually navigates to (reduces initial bundle ~60%)
// ─────────────────────────────────────────────────────────────────────────────

// Public
const Home            = lazy(() => import('./pages/Home'));
const Products        = lazy(() => import('./pages/Products'));
const ProductDetails  = lazy(() => import('./pages/ProductDetails'));
const Contact         = lazy(() => import('./pages/Contact'));
const Login           = lazy(() => import('./pages/Login'));
const Register        = lazy(() => import('./pages/Register'));
const AuctionPage     = lazy(() => import('./pages/AuctionPage'));
const RefurbishedProducts = lazy(() => import('./pages/RefurbishedProducts'));

// Forum
const ForumList = lazy(() => import('./pages/Forum/ForumList'));
const ForumPost = lazy(() => import('./pages/Forum/ForumPost'));

// Protected (user)
const Cart              = lazy(() => import('./pages/Cart'));
const Checkout          = lazy(() => import('./pages/Checkout'));
const Orders            = lazy(() => import('./pages/Orders'));
const BecomeSeller      = lazy(() => import('./pages/BecomeSeller'));
const BecomeTechnician  = lazy(() => import('./pages/BecomeTechnician'));
const BecomeDriver      = lazy(() => import('./pages/BecomeDriver'));
const BecomeLogistics   = lazy(() => import('./pages/BecomeLogistics'));
const BecomeRefurbisher = lazy(() => import('./pages/BecomeRefurbisher'));
const WishlistPage      = lazy(() => import('./pages/WishlistPage'));
const PriceAlertPage    = lazy(() => import('./pages/PriceAlertPage'));
const SupportTicketsPage = lazy(() => import('./pages/SupportTicketsPage'));
const CompatibilityPage  = lazy(() => import('./pages/CompatibilityPage'));
const B2BQuotesPage      = lazy(() => import('./pages/B2BQuotesPage'));
const InstallationsPage  = lazy(() => import('./pages/InstallationsPage'));
const Profile            = lazy(() => import('./pages/Profile'));
const TechnicianDashboard = lazy(() => import('./pages/TechnicianDashboard'));
const DriverDashboard     = lazy(() => import('./pages/DriverDashboard'));
const LogisticsDashboard  = lazy(() => import('./pages/LogisticsDashboard'));
const RefurbisherDashboard = lazy(() => import('./pages/RefurbisherDashboard'));
const DashboardOverview   = lazy(() => import('./components/DashboardOverview'));

// Admin
const AdminDashboard      = lazy(() => import('./pages/Admin/Dashboard'));
const AdminUsers          = lazy(() => import('./pages/Admin/Users'));
const AdminProducts       = lazy(() => import('./pages/Admin/Products'));
const AdminOrders         = lazy(() => import('./pages/Admin/Orders'));
const AdminMessages       = lazy(() => import('./pages/Admin/Messages'));
const AdminSellers        = lazy(() => import('./pages/Admin/Sellers'));
const AdminInventory      = lazy(() => import('./pages/Admin/Inventory'));
const AdminSupportTickets = lazy(() => import('./pages/Admin/AdminSupportTickets'));
const SuperAdminDashboard = lazy(() => import('./pages/Admin/SuperAdminDashboard'));
const AdminLogistics      = lazy(() => import('./pages/Admin/AdminLogistics'));

// Seller
const SellerDashboard  = lazy(() => import('./pages/Seller/Dashboard'));
const SellerProducts   = lazy(() => import('./pages/Seller/Products'));
const SellerOrders     = lazy(() => import('./pages/Seller/Orders'));
const SellerEarnings   = lazy(() => import('./pages/Seller/Earnings'));
const AddProductSimple = lazy(() => import('./pages/Seller/AddProductSimple'));

// ─────────────────────────────────────────────────────────────────────────────
// Loading Fallback — shown while a lazy chunk is downloading
// ─────────────────────────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
      </div>
      <p className="text-sm text-gray-400 font-medium">Loading…</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Route Guards
// ─────────────────────────────────────────────────────────────────────────────
const PrivateRoute = ({ children, adminOnly = false, sellerOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  if (sellerOnly && user.role !== 'seller' && user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
};

// ─────────────────────────────────────────────────────────────────────────────
// All Routes
// ─────────────────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={user ? <DashboardOverview /> : <Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auctions" element={<AuctionPage />} />
        <Route path="/refurbished-parts" element={<RefurbishedProducts />} />

        {/* Forum */}
        <Route path="/forum" element={<ForumList />} />
        <Route path="/forum/post/:id" element={<ForumPost />} />

        {/* Protected — regular user */}
        <Route path="/cart"                 element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="/checkout"             element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="/orders"               element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/become-seller"        element={<PrivateRoute><BecomeSeller /></PrivateRoute>} />
        <Route path="/become-technician"    element={<PrivateRoute><BecomeTechnician /></PrivateRoute>} />
        <Route path="/become-driver"        element={<PrivateRoute><BecomeDriver /></PrivateRoute>} />
        <Route path="/become-logistics"     element={<PrivateRoute><BecomeLogistics /></PrivateRoute>} />
        <Route path="/become-refurbisher"   element={<PrivateRoute><BecomeRefurbisher /></PrivateRoute>} />
        <Route path="/wishlist"             element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
        <Route path="/price-alerts"         element={<PrivateRoute><PriceAlertPage /></PrivateRoute>} />
        <Route path="/support/tickets"      element={<PrivateRoute><SupportTicketsPage /></PrivateRoute>} />
        <Route path="/compatibility"        element={<PrivateRoute><CompatibilityPage /></PrivateRoute>} />
        <Route path="/b2b/quotes"           element={<PrivateRoute><B2BQuotesPage /></PrivateRoute>} />
        <Route path="/installations"        element={<PrivateRoute><InstallationsPage /></PrivateRoute>} />
        <Route path="/profile"              element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/technician/dashboard" element={<PrivateRoute><TechnicianDashboard /></PrivateRoute>} />
        <Route path="/driver/dashboard"     element={<PrivateRoute><DriverDashboard /></PrivateRoute>} />
        <Route path="/logistics/dashboard"  element={<PrivateRoute><LogisticsDashboard /></PrivateRoute>} />
        <Route path="/refurbisher/dashboard" element={<PrivateRoute><RefurbisherDashboard /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin"                  element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/users"            element={<PrivateRoute adminOnly><AdminUsers /></PrivateRoute>} />
        <Route path="/admin/products"         element={<PrivateRoute adminOnly><AdminProducts /></PrivateRoute>} />
        <Route path="/admin/orders"           element={<PrivateRoute adminOnly><AdminOrders /></PrivateRoute>} />
        <Route path="/admin/messages"         element={<PrivateRoute adminOnly><AdminMessages /></PrivateRoute>} />
        <Route path="/admin/sellers"          element={<PrivateRoute adminOnly><AdminSellers /></PrivateRoute>} />
        <Route path="/admin/inventory"        element={<PrivateRoute adminOnly><AdminInventory /></PrivateRoute>} />
        <Route path="/admin/support-tickets"  element={<PrivateRoute adminOnly><AdminSupportTickets /></PrivateRoute>} />
        <Route path="/admin/super"            element={<PrivateRoute adminOnly><SuperAdminDashboard /></PrivateRoute>} />
        <Route path="/admin/logistics"        element={<PrivateRoute adminOnly><AdminLogistics /></PrivateRoute>} />

        {/* Seller */}
        <Route path="/seller"               element={<PrivateRoute sellerOnly><SellerDashboard /></PrivateRoute>} />
        <Route path="/seller/products"      element={<PrivateRoute sellerOnly><SellerProducts /></PrivateRoute>} />
        <Route path="/seller/products/new"  element={<PrivateRoute sellerOnly><AddProductSimple /></PrivateRoute>} />
        <Route path="/seller/orders"        element={<PrivateRoute sellerOnly><SellerOrders /></PrivateRoute>} />
        <Route path="/seller/earnings"      element={<PrivateRoute sellerOnly><SellerEarnings /></PrivateRoute>} />

        {/* Catch-all 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App Root
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#6366f1', secondary: '#fff' },
              },
            }}
          />
          <Chatbot />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
