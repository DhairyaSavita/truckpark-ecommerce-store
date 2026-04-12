import React, { useState, useEffect } from 'react';
import { refurbishedAPI } from '../services/api';
import { ArrowPathIcon, CurrencyRupeeIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const RefurbishedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [sortBy, setSortBy] = useState('price_low');

  const conditions = ['all', 'Like New', 'Excellent', 'Good', 'Fair', 'For Parts'];

  useEffect(() => {
    fetchProducts();
  }, [selectedCondition, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/refurbished/products';
      const params = new URLSearchParams();
      if (selectedCondition !== 'all') params.append('condition', selectedCondition);
      if (sortBy) params.append('sort', sortBy);
      
      const response = await refurbishedAPI.getAllProducts(params);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching refurbished products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConditionColor = (condition) => {
    const colors = {
      'Like New': 'bg-green-100 text-green-800',
      'Excellent': 'bg-blue-100 text-blue-800',
      'Good': 'bg-yellow-100 text-yellow-800',
      'Fair': 'bg-orange-100 text-orange-800',
      'For Parts': 'bg-red-100 text-red-800'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        <div className="text-center mb-8">
          <ArrowPathIcon className="h-16 w-16 mx-auto text-green-600 mb-4" />
          <h1 className="text-3xl font-bold">Refurbished Truck Parts</h1>
          <p className="text-gray-600 mt-2">Quality refurbished parts at discounted prices</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <div className="flex flex-wrap gap-2">
                {conditions.map(condition => (
                  <button
                    key={condition}
                    onClick={() => setSelectedCondition(condition)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedCondition === condition
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {condition === 'all' ? 'All' : condition}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-80"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <ArrowPathIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No refurbished products found</h3>
            <p className="text-gray-500">Check back later for new listings</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=Refurbished'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  {product.discount_percentage > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      {Math.round(product.discount_percentage)}% OFF
                    </span>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${getConditionColor(product.condition)}`}>
                    {product.condition}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{product.title}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      {product.original_price && (
                        <p className="text-sm text-gray-400 line-through">₹{product.original_price.toLocaleString()}</p>
                      )}
                      <p className="text-2xl font-bold text-green-600">₹{product.selling_price.toLocaleString()}</p>
                    </div>
                    {product.warranty_months > 0 && (
                      <span className="text-xs text-blue-600 flex items-center">
                        <ShieldCheckIcon className="h-3 w-3 mr-1" />
                        {product.warranty_months} months warranty
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500">
                      <TruckIcon className="h-3 w-3 mr-1" />
                      Free Shipping
                    </div>
                    <Link
                      to={`/refurbished/${product.id}`}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RefurbishedProducts;
