import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCartIcon, EyeIcon, StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import WishlistButton from './WishlistButton';
import PriceAlertButton from './PriceAlertButton';
import ProductImage from './ProductImage';
import { cart } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/* ─── Star Rating ─── */
const StarRating = ({ rating = 0, count = 0 }) => {
  const stars = [1, 2, 3, 4, 5];
  const r = parseFloat(rating) || 0;
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {stars.map((s) =>
          s <= Math.floor(r) ? (
            <StarSolid key={s} className="h-3.5 w-3.5 text-amber-400" />
          ) : s === Math.ceil(r) && r % 1 >= 0.3 ? (
            // half star via clip trick
            <span key={s} className="relative h-3.5 w-3.5">
              <StarOutline className="absolute inset-0 h-3.5 w-3.5 text-amber-300" />
              <span className="absolute inset-0 w-1/2 overflow-hidden">
                <StarSolid className="h-3.5 w-3.5 text-amber-400" />
              </span>
            </span>
          ) : (
            <StarOutline key={s} className="h-3.5 w-3.5 text-gray-300" />
          )
        )}
      </div>
      {count > 0 && (
        <span className="text-xs text-gray-400 ml-0.5">({count})</span>
      )}
    </div>
  );
};

/* ─── Stock Badge ─── */
const StockBadge = ({ qty }) => {
  if (qty === 0)
    return (
      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-sm">
        Out of Stock
      </span>
    );
  if (qty < 10)
    return (
      <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-sm">
        Only {qty} left
      </span>
    );
  return null;
};

/* ─── Main Card ─── */
const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

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
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);

  const rating = parseFloat(product.rating) || 0;
  const reviewCount = parseInt(product.reviews_count) || 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Image area */}
      <Link to={`/products/${product.id}`} className="block relative">
        <div className="relative overflow-hidden bg-gray-50">
          <ProductImage
            product={product}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Stock badge */}
          <StockBadge qty={product.stock_quantity} />

          {/* Hover action buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-x-4 group-hover:translate-x-0">
            <WishlistButton productId={product.id} productName={product.name} />
            <PriceAlertButton
              productId={product.id}
              productName={product.name}
              currentPrice={product.price}
            />
          </div>
        </div>
      </Link>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/products/${product.id}`} className="flex-1">
          {/* Brand pill */}
          {product.brand && (
            <span className="inline-block text-xs text-indigo-600 bg-indigo-50 font-medium px-2 py-0.5 rounded-full mb-2">
              {product.brand}
            </span>
          )}

          {/* Product name */}
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors leading-snug mb-1">
            {product.name}
          </h3>

          {/* Rating row */}
          {(rating > 0 || reviewCount > 0) ? (
            <StarRating rating={rating} count={reviewCount} />
          ) : (
            <p className="text-gray-400 text-xs">No reviews yet</p>
          )}

          {/* Description snippet */}
          <p className="text-gray-500 text-xs mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </Link>

        {/* Price + CTA row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div>
            <p className="text-xl font-bold text-indigo-600">{formatPrice(product.price)}</p>
            {product.part_number && (
              <p className="text-xs text-gray-400 mt-0.5">PN: {product.part_number}</p>
            )}
          </div>

          <button
            onClick={addToCart}
            disabled={isAdding || product.stock_quantity === 0}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              product.stock_quantity === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5'
            }`}
          >
            <ShoppingCartIcon className="h-4 w-4" />
            {isAdding ? 'Adding…' : 'Add'}
          </button>
        </div>

        {/* View details link */}
        <Link
          to={`/products/${product.id}`}
          className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <EyeIcon className="h-3.5 w-3.5" />
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

export default ProductCard;
