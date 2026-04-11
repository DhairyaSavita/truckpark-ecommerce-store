import React, { useState, useEffect } from 'react';
import { wishlistAPI, priceAlertAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HeartIcon, BellIcon, TrashIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const PriceAlert = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('wishlist');
  const [loading, setLoading] = useState(true);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [targetPrice, setTargetPrice] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wishlistRes, alertsRes] = await Promise.all([
        wishlistAPI.getWishlist(),
        priceAlertAPI.getAlerts()
      ]);
      setWishlist(wishlistRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistAPI.remove(productId);
      toast.success('Removed from wishlist');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  const setPriceAlert = async (productId, price) => {
    try {
      await priceAlertAPI.create({ product_id: productId, target_price: price });
      toast.success(`Price alert set for ₹${price}`);
      setShowPriceModal(false);
      setTargetPrice('');
      fetchData();
    } catch (error) {
      toast.error('Failed to set price alert');
    }
  };

  const removeAlert = async (alertId) => {
    try {
      await priceAlertAPI.remove(alertId);
      toast.success('Price alert removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove alert');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Wishlist & Alerts</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-6 py-2 font-semibold ${activeTab === 'wishlist' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Wishlist ({wishlist.length})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-6 py-2 font-semibold ${activeTab === 'alerts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Price Alerts ({alerts.length})
        </button>
      </div>

      {/* Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlist.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <HeartIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-4">Save your favorite products here</p>
              <a href="/products" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
                Browse Products
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={item.Product?.image_url || 'https://via.placeholder.com/300x200?text=Product'}
                    alt={item.Product?.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{item.Product?.name}</h3>
                    <p className="text-gray-600">{item.Product?.brand}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xl font-bold text-blue-600">₹{item.Product?.price}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(item.Product);
                            setShowPriceModal(true);
                          }}
                          className="p-2 bg-yellow-100 rounded-full hover:bg-yellow-200"
                          title="Set Price Alert"
                        >
                          <BellIcon className="h-5 w-5 text-yellow-600" />
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.product_id)}
                          className="p-2 bg-red-100 rounded-full hover:bg-red-200"
                          title="Remove from Wishlist"
                        >
                          <TrashIcon className="h-5 w-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <a
                      href={`/products/${item.product_id}`}
                      className="mt-3 block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                      View Product
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Alerts Tab */}
      {activeTab === 'alerts' && (
        <div>
          {alerts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <BellIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No price alerts</h3>
              <p className="text-gray-500">Set alerts to get notified when prices drop</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {alerts.map((alert) => (
                    <tr key={alert.id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">{alert.Product?.name}</div>
                          <div className="text-sm text-gray-500">{alert.Product?.brand}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">₹{alert.Product?.price}</td>
                      <td className="px-6 py-4 font-semibold text-green-600">₹{alert.target_price}</td>
                      <td className="px-6 py-4">
                        {alert.Product?.price <= alert.target_price ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Price Dropped!</span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Waiting</span>
                        )}
                       </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => removeAlert(alert.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Price Alert Modal */}
      {showPriceModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Set Price Alert</h3>
              <button onClick={() => setShowPriceModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600">Product: {selectedProduct.name}</p>
              <p className="text-gray-600">Current Price: ₹{selectedProduct.price}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Target Price (₹)</label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="Enter price you want to pay"
                className="w-full border rounded px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">We'll notify you when price drops to or below this amount</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowPriceModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button
                onClick={() => setPriceAlert(selectedProduct.id, targetPrice)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Set Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceAlert;
