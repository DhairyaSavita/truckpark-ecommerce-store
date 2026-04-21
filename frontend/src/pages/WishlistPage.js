import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI, priceAlertAPI } from '../services/api';
import { HeartIcon, TrashIcon, BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import PriceAlertButton from '../components/PriceAlertButton';

const WishlistPage = () => {
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState([]);

  useEffect(() => {
    fetchWishlist();
    fetchPriceAlerts();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await wishlistAPI.getWishlist();
      setWishlistItems(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceAlerts = async () => {
    try {
      const response = await priceAlertAPI.getAlerts();
      setPriceAlerts(response.data);
    } catch (error) {
      console.error('Error fetching price alerts:', error);
    }
  };

  const removeFromWishlist = async (productId, productName) => {
    try {
      await wishlistAPI.remove(productId);
      toast.success(`${productName} removed from wishlist`);
      fetchWishlist();
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return <div className="text-center py-10">Loading wishlist...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
      <p className="text-gray-600 mb-6">Products you've saved for later</p>

      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <HeartIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-4">Save your favorite products here</p>
          <Link to="/products" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const product = item.Product;
            const hasPriceAlert = priceAlerts.some(alert => alert.product_id === product.id);
            
            return (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <Link to={`/products/${product.id}`}>
                  <img
                    src={product.image_url || 'https://via.placeholder.com/300x200?text=Product'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-semibold text-lg hover:text-blue-600 transition">{product.name}</h3>
                    <p className="text-gray-600 text-sm">{product.brand}</p>
                  </Link>
                  
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(product.price)}</p>
                    {product.stock_quantity > 0 ? (
                      <p className="text-sm text-green-600">In Stock ({product.stock_quantity})</p>
                    ) : (
                      <p className="text-sm text-red-600">Out of Stock</p>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex space-x-2">
                      <PriceAlertButton 
                        productId={product.id} 
                        productName={product.name} 
                        currentPrice={product.price}
                      />
                      <button
                        onClick={() => removeFromWishlist(product.id, product.name)}
                        className="p-2 rounded-full hover:bg-gray-100 text-red-500"
                        title="Remove from wishlist"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <Link
                      to={`/products/${product.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                      View Product
                    </Link>
                  </div>
                  
                  {hasPriceAlert && (
                    <div className="mt-2 text-xs text-yellow-600 flex items-center">
                      <BellIcon className="h-3 w-3 mr-1" />
                      Price alert active
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
