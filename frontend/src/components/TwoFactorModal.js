import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TwoFactorModal = ({ userId, onSuccess, onCancel }) => {
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!code) {
      toast.error('Please enter verification code');
      return;
    }
    
    setLoading(true);
    try {
      // Complete login with 2FA
      const response = await authAPI.verify2FALogin({ 
        userId, 
        code, 
        isBackupCode: useBackupCode 
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        onSuccess(response.data.user);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="text-center mb-4">
          <ShieldCheckIcon className="h-12 w-12 mx-auto text-blue-600 mb-2" />
          <h3 className="text-lg font-bold">Two-Factor Authentication</h3>
          <p className="text-gray-600 text-sm">
            {useBackupCode 
              ? 'Enter one of your backup codes' 
              : 'Enter the 6-digit code from your authenticator app'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={useBackupCode ? 'Enter backup code' : 'Enter 6-digit code'}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4 text-center text-lg"
            maxLength={useBackupCode ? 8 : 6}
            autoFocus
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-2"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          
          <button
            type="button"
            onClick={() => setUseBackupCode(!useBackupCode)}
            className="w-full text-sm text-blue-600 hover:text-blue-800"
          >
            {useBackupCode ? 'Use authenticator app' : 'Use backup code'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="w-full text-sm text-gray-500 hover:text-gray-700 mt-2"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorModal;
