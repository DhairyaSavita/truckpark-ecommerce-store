import React, { useState, useEffect } from 'react';
import { sellerAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SellerEarnings = () => {
  const [earnings, setEarnings] = useState([]);
  const [stats, setStats] = useState({ totalEarnings: 0, pendingEarnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await sellerAPI.getEarnings();
      setEarnings(response.data.earnings || []);
      setStats({
        totalEarnings: response.data.totalEarnings || 0,
        pendingEarnings: response.data.pendingEarnings || 0
      });
    } catch (error) {
      toast.error('Failed to fetch earnings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading earnings...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Earnings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm">Total Earnings</h3>
          <p className="text-3xl font-bold text-green-600">${stats.totalEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm">Pending Payout</h3>
          <p className="text-3xl font-bold text-yellow-600">${stats.pendingEarnings.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {earnings.map((earning) => (
              <tr key={earning.id}>
                <td className="px-6 py-4">#{earning.order_id}</td>
                <td className="px-6 py-4">${earning.amount}</td>
                <td className="px-6 py-4">${earning.commission}</td>
                <td className="px-6 py-4 font-semibold">${earning.net_amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    earning.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {earning.status}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(earning.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerEarnings;
