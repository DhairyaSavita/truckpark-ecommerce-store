import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TwoFactorSetup = ({ onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const setup2FA = async () => {
    setLoading(true);
    try {
      const response = await authAPI.setup2FA();
      setSecret(response.data.secret);
      setQrCode(response.data.qrCode);
      setBackupCodes(response.data.backupCodes);
      setStep(2);
    } catch (error) {
      toast.error('Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    if (!verificationCode) {
      toast.error('Please enter verification code');
      return;
    }
    
    setLoading(true);
    try {
      await authAPI.verify2FA(verificationCode);
      toast.success('2FA enabled successfully!');
      onClose?.();
    } catch (error) {
      toast.error('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-600" />
            Two-Factor Authentication
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {step === 1 && (
          <div>
            <p className="text-gray-600 mb-4">
              Enhance your account security by enabling two-factor authentication.
              You'll need to use an authenticator app like Google Authenticator.
            </p>
            <button
              onClick={setup2FA}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {loading ? 'Setting up...' : 'Set up 2FA'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">1. Scan QR Code</label>
              {qrCode && (
                <img src={qrCode} alt="QR Code" className="mx-auto border p-2 rounded" />
              )}
              <p className="text-xs text-gray-500 mt-2">Or enter this code manually:</p>
              <code className="block bg-gray-100 p-2 rounded text-sm font-mono break-all">
                {secret}
              </code>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">2. Save Backup Codes</label>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800 mb-2">
                  Save these backup codes in a secure place. You can use them if you lose access to your authenticator app.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, idx) => (
                    <code key={idx} className="bg-white p-1 rounded text-xs font-mono">
                      {code}
                    </code>
                  ))}
                </div>
                <button
                  onClick={() => copyToClipboard(backupCodes.join('\n'))}
                  className="mt-2 text-blue-600 text-sm flex items-center"
                >
                  <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                  Copy all codes
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">3. Verify Setup</label>
              <input
                type="text"
                placeholder="Enter 6-digit code from authenticator"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full border rounded px-3 py-2"
                maxLength="6"
              />
            </div>

            <button
              onClick={verify2FA}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              {loading ? 'Verifying...' : 'Verify and Enable'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;
