import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import BrandBanner from '../components/BrandBanner';
import { products } from '../services/api';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

/* ─── useDebounce hook ─── */
function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/* ─── Constants ─── */
const PAGE_SIZE = 12;

const indianBrands = [
  'Tata Motors', 'Ashok Leyland', 'Mahindra', 'BharatBenz',
  'Eicher', 'Force Motors', 'SML Isuzu', 'MAN Trucks',
  'Volvo Trucks', 'Scania', 'Cummins', 'Bosch', 'Bendix', 'Eaton',
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/* ─── Skeleton Card ─── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-8 bg-gray-200 rounded-xl" />
    </div>
  </div>
);

/* ─── Pagination ─── */
const Pagination = ({ current, total, onChange }) => {
  if (total <= 1) return null;
  const pages = [];
  for (let i = 1; i <= total; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="p-2 rounded-xl border border-gray-200 hover:border-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
      </button>

      {pages.slice(Math.max(0, current - 3), Math.min(total, current + 2)).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
            p === current
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="p-2 rounded-xl border border-gray-200 hover:border-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRightIcon className="h-4 w-4 text-gray-600" />
      </button>
    </div>
  );
};

/* ─── Main Component ─── */
const Products = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest');
  const [showBrands, setShowBrands] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 350);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, selectedBrand, priceRange.min, priceRange.max, sortBy]);


  // Fetch categories once
  useEffect(() => {
    products.getCategories()
      .then((r) => setCategories(r.data))
      .catch(() => {});
  }, []);

  // Fetch products whenever debounced filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = parseInt(selectedCategory);
      if (selectedBrand) params.brand = selectedBrand;
      if (debouncedSearch) params.search = debouncedSearch;
      if (priceRange.min) params.minPrice = parseFloat(priceRange.min);
      if (priceRange.max) params.maxPrice = parseFloat(priceRange.max);
      if (sortBy) params.sort = sortBy;

      const response = await products.getAll(params);
      setAllProducts(response.data || []);
    } catch {
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedBrand, priceRange.min, priceRange.max, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSearchInput('');
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedCategory || selectedBrand || searchInput || priceRange.min || priceRange.max;

  // Client-side pagination
  const totalPages = Math.ceil(allProducts.length / PAGE_SIZE);
  const pagedProducts = allProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const getBrandCount = (brand) => allProducts.filter((p) => p.brand === brand).length;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
            Indian Truck Spare Parts
          </h1>
          <p className="text-gray-500">
            Genuine OEM & aftermarket parts for all Indian truck brands (2010+)
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name, brand, or part number…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-sm"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Filter Pills */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
          className="mb-5"
        >
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === ''
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id.toString())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id.toString()
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Brand Showcase Tiles */}
        {showBrands && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Featured Brands
              </h3>
              <button
                onClick={() => setShowBrands(false)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Hide
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {indianBrands.slice(0, 10).map((brand) => (
                <div key={brand} onClick={() => setSelectedBrand(brand)}>
                  <BrandBanner brand={brand} count={getBrandCount(brand)} />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Brand Filter Pills */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
          className="mb-5"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Filter by Brand
            </h3>
            {selectedBrand && (
              <button
                onClick={() => setSelectedBrand('')}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBrand('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedBrand === ''
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-400'
              }`}
            >
              All Brands
            </button>
            {indianBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedBrand === brand
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-400'
                }`}
              >
                {brand}
                {getBrandCount(brand) > 0 && (
                  <span className="ml-1 opacity-70">({getBrandCount(brand)})</span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Advanced Filters Toggle */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.25 }}
          className="mb-4"
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <FunnelIcon className="h-4 w-4" />
            {showFilters ? 'Hide Advanced Filters' : 'Advanced Filters'}
          </button>
        </motion.div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Min Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Max Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50,000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count + active filter chips */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.3 }}
          className="mb-5 flex flex-wrap items-center gap-3"
        >
          <p className="text-sm text-gray-500">
            Showing{' '}
            <span className="font-bold text-indigo-600">
              {Math.min((currentPage - 1) * PAGE_SIZE + 1, allProducts.length)}–
              {Math.min(currentPage * PAGE_SIZE, allProducts.length)}
            </span>{' '}
            of <span className="font-bold text-gray-700">{allProducts.length}</span> products
          </p>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs bg-red-50 text-red-500 border border-red-200 px-3 py-1 rounded-full hover:bg-red-100 transition-colors"
            >
              <XMarkIcon className="h-3 w-3" />
              Clear All
            </button>
          )}
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(PAGE_SIZE)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : pagedProducts.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center py-20 bg-white rounded-2xl shadow-sm"
          >
            <CubeIcon className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-400 text-sm mb-6">
              Try adjusting your filters or search term
            </p>
            <button
              onClick={clearFilters}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Clear All Filters
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {pagedProducts.map((product) => (
                <motion.div key={product.id} variants={fadeInUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            <Pagination
              current={currentPage}
              total={totalPages}
              onChange={(p) => {
                setCurrentPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Products;