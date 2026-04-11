import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import TwoFactorSetup from '../components/TwoFactorSetup';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch2FAStatus();
  }, []);

  const fetch2FAStatus = async () => {
    try {
      const response = await authAPI.get2FAStatus();
      setTwoFactorEnabled(response.data.enabled);
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    const password = prompt('Enter your password to disable 2FA:');
    if (!password) return;
    
    const code = prompt('Enter your 2FA code:');
    if (!code) return;
    
    try {
      await authAPI.disable2FA({ password, twoFactorCode: code });
      toast.success('2FA disabled successfully');
      setTwoFactorEnabled(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to disable 2FA');
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-3">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          <p><strong>Phone:</strong> {user?.phone || 'Not provided'}</p>
          <p><strong>Address:</strong> {user?.address || 'Not provided'}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Two-Factor Authentication</h2>
            <p className="text-gray-600">
              {twoFactorEnabled 
                ? '✅ Your account is protected with 2FA' 
                : '🔐 Add an extra layer of security to your account'}
            </p>
          </div>
          
          {twoFactorEnabled ? (
            <button
              onClick={disable2FA}
              className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50"
            >
              Disable 2FA
            </button>
          ) : (
            <button
              onClick={() => setShow2FASetup(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Enable 2FA
            </button>
          )}
        </div>
      </div>

      {show2FASetup && (
        <TwoFactorSetup 
          onClose={() => setShow2FASetup(false)}
          onEnabled={() => {
            setTwoFactorEnabled(true);
            fetch2FAStatus();
          }}
        />
      )}
    </div>
  );
};

export default Profile;
