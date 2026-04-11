import React, { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { wishlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const WishlistButton = ({ productId, productName, className = '' }) => {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && productId) {
      checkWishlistStatus();
    }
  }, [user, productId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistAPI.check(productId);
      setIsWishlisted(response.data.isWishlisted);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    setLoading(true);
    try {
      if (isWishlisted) {
        await wishlistAPI.remove(productId);
        setIsWishlisted(false);
        toast.success(`${productName || 'Product'} removed from wishlist`);
      } else {
        await wishlistAPI.add(productId);
        setIsWishlisted(true);
        toast.success(`${productName || 'Product'} added to wishlist`);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error(error.response?.data?.error || 'Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isWishlisted ? (
        <HeartSolid className="h-6 w-6 text-red-500" />
      ) : (
        <HeartIcon className="h-6 w-6 text-gray-500 hover:text-red-500" />
      )}
    </button>
  );
};

export default WishlistButton;
