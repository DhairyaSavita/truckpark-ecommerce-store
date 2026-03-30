import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products, cart } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EnquiryForm from '../components/EnquiryForm';
import toast from 'react-hot-toast';
import { ShoppingCartIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await products.getById(id);
      setProduct(response.data);
    } catch (error) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast.error('Please login to add to cart');
      return;
    }

    setAdding(true);
    try {
      await cart.add({ product_id: product.id, quantity });
      toast.success(`${quantity} x ${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Link to="/products" className="text-blue-600 hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/products" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Products
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <img
            src={product.image_url || 'https://via.placeholder.com/600x400?text=Truck+Part'}
            alt={product.name}
            className="w-full h-96 object-cover"
          />
        </div>
        
        {/* Product Info */}
        <div>
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center space-x-2 mb-2">
              {product.brand && (
                <span className="text-sm text-gray-600">Brand: {product.brand}</span>
              )}
              {product.part_number && (
                <span className="text-sm text-gray-500">| Part #: {product.part_number}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.stock_quantity > 0 && (
                <span className="text-sm text-green-600">In Stock ({product.stock_quantity})</span>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>
          
          {product.specifications && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Specifications</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <table className="w-full">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <tr key={key} className="border-b last:border-0">
                        <td className="py-2 font-medium capitalize">{key.replace(/_/g, ' ')}</td>
                        <td className="py-2 text-gray-600">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Add to Cart Section */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center border rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 border-r hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="px-3 py-2 border-l hover:bg-gray-100"
                  disabled={quantity >= product.stock_quantity}
                >
                  +
                </button>
              </div>
              <button
                onClick={addToCart}
                disabled={adding || product.stock_quantity === 0}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-2 rounded transition-colors ${
                  product.stock_quantity === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enquiry Section */}
      <div className="mt-8">
        <EnquiryForm productName={product.name} productId={product.id} />
      </div>
    </div>
  );
};

export default ProductDetails;
