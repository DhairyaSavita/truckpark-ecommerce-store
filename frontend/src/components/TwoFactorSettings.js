import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import TwoFactorSetup from './TwoFactorSetup';
import toast from 'react-hot-toast';

const TwoFactorSettings = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await authAPI.get2FAStatus();
      setIsEnabled(response.data.enabled);
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
      setIsEnabled(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to disable 2FA');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isEnabled ? (
            <ShieldCheckIcon className="h-8 w-8 text-green-600 mr-3" />
          ) : (
            <ShieldExclamationIcon className="h-8 w-8 text-gray-400 mr-3" />
          )}
          <div>
            <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600">
              {isEnabled 
                ? 'Your account is protected with 2FA' 
                : 'Add an extra layer of security to your account'}
            </p>
          </div>
        </div>
        
        {isEnabled ? (
          <button
            onClick={disable2FA}
            className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50"
          >
            Disable 2FA
          </button>
        ) : (
          <button
            onClick={() => setShowSetup(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Enable 2FA
          </button>
        )}
      </div>

      {showSetup && (
        <TwoFactorSetup onClose={() => {
          setShowSetup(false);
          fetchStatus();
        }} />
      )}
    </div>
  );
};

export default TwoFactorSettings;
