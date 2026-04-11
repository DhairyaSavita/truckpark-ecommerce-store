import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import TwoFactorModal from '../components/TwoFactorModal';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data.requiresTwoFactor) {
        setPendingUserId(response.data.userId);
        setShow2FAModal(true);
      } else {
        localStorage.setItem('token', response.data.token);
        await login(email, password);
        toast.success('Login successful!');
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASuccess = async (userData) => {
    setShow2FAModal(false);
    // Update auth context with user data
    await login(email, password);
    toast.success('Login successful!');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link to="/forgot-password" className="text-gray-500 hover:text-gray-700">
            Forgot Password?
          </Link>
        </p>
      </div>

      {show2FAModal && (
        <TwoFactorModal
          userId={pendingUserId}
          onSuccess={handle2FASuccess}
          onCancel={() => setShow2FAModal(false)}
        />
      )}
    </div>
  );
};

export default Login;
