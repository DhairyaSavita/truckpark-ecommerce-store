import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import WishlistButton from './WishlistButton';
import PriceAlertButton from './PriceAlertButton';
import { cart } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = React.useState(false);

  const addToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    setIsAdding(true);
    try {
      await cart.add({ product_id: product.id, quantity: 1 });
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <Link to={`/products/${product.id}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={product.image_url || 'https://via.placeholder.com/300x200?text=Truck+Part'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.stock_quantity < 10 && product.stock_quantity > 0 && (
            <span className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Low Stock
            </span>
          )}
          <div className="absolute top-2 right-2 flex space-x-1">
            <WishlistButton productId={product.id} productName={product.name} />
            <PriceAlertButton productId={product.id} productName={product.name} currentPrice={product.price} />
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
              {product.name}
            </h3>
            {product.brand && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-2">
                {product.brand}
              </span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
        </Link>
        
        <div className="flex justify-between items-center mt-3">
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</p>
            {product.part_number && (
              <p className="text-xs text-gray-500">PN: {product.part_number}</p>
            )}
          </div>
          <button
            onClick={addToCart}
            disabled={isAdding || product.stock_quantity === 0}
            className={`flex items-center space-x-1 px-4 py-2 rounded transition-colors ${
              product.stock_quantity === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <ShoppingCartIcon className="h-5 w-5" />
            <span>{isAdding ? 'Adding...' : 'Add'}</span>
          </button>
        </div>
        
        <Link
          to={`/products/${product.id}`}
          className="flex items-center justify-center space-x-1 mt-3 text-blue-600 hover:text-blue-800 text-sm"
        >
          <InformationCircleIcon className="h-4 w-4" />
          <span>View Details</span>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
