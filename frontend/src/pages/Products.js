import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { products } from '../services/api';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Products = () => {
  const [productList, setProductList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm, priceRange.min, priceRange.max, selectedBrand, sortBy]);

  const fetchCategories = async () => {
    try {
      const response = await products.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory && selectedCategory !== '') {
        params.category = parseInt(selectedCategory);
      }
      if (searchTerm) params.search = searchTerm;
      if (priceRange.min) params.minPrice = parseFloat(priceRange.min);
      if (priceRange.max) params.maxPrice = parseFloat(priceRange.max);
      if (selectedBrand) params.brand = selectedBrand;
      if (sortBy) params.sort = sortBy;
      
      const response = await products.getAll(params);
      setProductList(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setPriceRange({ min: '', max: '' });
    setSelectedBrand('');
    setSortBy('newest');
  };

  const brands = [...new Set(productList.map(p => p.brand).filter(b => b))];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Truck Spare Parts
          </h1>
          <p className="text-gray-600">Find the perfect parts for your truck</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name, brand, or part number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* Categories Filter */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full transition-all ${
                selectedCategory === '' 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Products
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id.toString())}
                className={`px-4 py-2 rounded-full transition-all ${
                  selectedCategory === category.id.toString() 
                    ? 'bg-primary-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Filter Toggle */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
          >
            <FunnelIcon className="h-5 w-5" />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </motion.div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-md p-6 mb-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Brands</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 text-right">
                <button
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800 text-sm flex items-center ml-auto"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.4 }}
          className="mb-4 text-gray-600"
        >
          Found {productList.length} products
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-80"></div>
            ))}
          </div>
        ) : productList.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center py-12 bg-white rounded-xl shadow-sm"
          >
            <p className="text-gray-500 text-lg">No products found</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-primary-600 hover:text-primary-800"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {productList.map(product => (
              <motion.div key={product.id} variants={fadeInUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Products;
