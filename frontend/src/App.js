import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import BecomeSeller from './pages/BecomeSeller';

// Admin imports
import AdminDashboard from './pages/Admin/Dashboard';
import Checkout from './pages/Checkout';
import AdminInventory from './pages/Admin/Inventory';
import AdminUsers from './pages/Admin/Users';
import AdminProducts from './pages/Admin/Products';
import AdminOrders from './pages/Admin/Orders';
import AdminMessages from './pages/Admin/Messages';
import AdminSellers from './pages/Admin/Sellers';

// Seller imports
import SellerDashboard from './pages/Seller/Dashboard';
import SellerProducts from './pages/Seller/Products';
import SellerOrders from './pages/Seller/Orders';
import SellerEarnings from './pages/Seller/Earnings';
import AddProductSimple from './pages/Seller/AddProductSimple';

// Forum imports
import ForumList from './pages/Forum/ForumList';
import ForumPost from './pages/Forum/ForumPost';

const PrivateRoute = ({ children, adminOnly = false, sellerOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  if (sellerOnly && user.role !== 'seller' && user.role !== 'admin') return <Navigate to="/" />;
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Products />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Forum Routes */}
      <Route path="/forum" element={<ForumList />} />
      <Route path="/forum/post/:id" element={<ForumPost />} />
      
      {/* Protected Routes */}
      <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
      <Route path="/admin/inventory" element={<PrivateRoute adminOnly><AdminInventory /></PrivateRoute>} />
      <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
      <Route path="/become-seller" element={<PrivateRoute><BecomeSeller /></PrivateRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/users" element={<PrivateRoute adminOnly><AdminUsers /></PrivateRoute>} />
      <Route path="/admin/products" element={<PrivateRoute adminOnly><AdminProducts /></PrivateRoute>} />
      <Route path="/admin/orders" element={<PrivateRoute adminOnly><AdminOrders /></PrivateRoute>} />
      <Route path="/admin/messages" element={<PrivateRoute adminOnly><AdminMessages /></PrivateRoute>} />
      <Route path="/admin/sellers" element={<PrivateRoute adminOnly><AdminSellers /></PrivateRoute>} />
      
      {/* Seller Routes */}
      <Route path="/seller" element={<PrivateRoute sellerOnly><SellerDashboard /></PrivateRoute>} />
      <Route path="/seller/products" element={<PrivateRoute sellerOnly><SellerProducts /></PrivateRoute>} />
      <Route path="/seller/products/new" element={<PrivateRoute sellerOnly><AddProductSimple /></PrivateRoute>} />
      <Route path="/seller/orders" element={<PrivateRoute sellerOnly><SellerOrders /></PrivateRoute>} />
      <Route path="/seller/earnings" element={<PrivateRoute sellerOnly><SellerEarnings /></PrivateRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <AppRoutes />
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
