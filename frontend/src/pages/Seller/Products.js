import React, { useState, useEffect, useRef } from 'react';
import { sellerAPI, uploadAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  EyeIcon,
  TrashIcon,
  PhotoIcon,
  CheckCircleIcon,
  CubeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

/* ─── Status Badge ─── */
const StatusBadge = ({ status }) => {
  const map = {
    approved: 'badge-green',
    rejected:  'badge-red',
    pending:   'badge-yellow',
  };
  return (
    <span className={`badge ${map[status] || 'badge-gray'} capitalize`}>
      {status || 'pending'}
    </span>
  );
};

/* ─── Quick Image Uploader (inline, for each product row) ─── */
const QuickImageUpload = ({ product, onUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      toast.error('Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }

    setUploading(true);
    try {
      const uploadRes = await uploadAPI.uploadProductImage(file);
      const imageUrl = uploadRes.data.imageUrl;

      // Update the product image_url in the database
      await sellerAPI.updateProduct(product.id, { image_url: imageUrl });
      toast.success('Image updated!');
      onUploaded(product.id, imageUrl);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-gray-100 bg-gray-50 shrink-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PhotoIcon className="h-6 w-6 text-gray-300" />
          </div>
        )}
      </div>

      {/* Upload overlay on hover */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/50 flex items-center justify-center transition-all duration-200 cursor-pointer"
        title={product.image_url ? 'Change image' : 'Add image'}
      >
        {uploading ? (
          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <PhotoIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {/* Indicator dot */}
      {product.image_url ? (
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" title="Has image" />
      ) : (
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white" title="No image" />
      )}
    </div>
  );
};

/* ─── Main ─── */
const SellerProducts = () => {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await sellerAPI.getProducts();
      setProductList(res.data || []);
    } catch {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUploaded = (productId, newUrl) => {
    setProductList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, image_url: newUrl } : p))
    );
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeletingId(id);
    try {
      await sellerAPI.deleteProduct(id);
      toast.success('Product deleted');
      setProductList((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  /* ── Stats ── */
  const stats = {
    total: productList.length,
    approved: productList.filter((p) => p.approval_status === 'approved').length,
    pending: productList.filter((p) => p.approval_status === 'pending').length,
    noImage: productList.filter((p) => !p.image_url).length,
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 skeleton rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Hover over a product thumbnail to update its image
          </p>
        </div>
        <Link to="/seller/products/new" className="btn-primary">
          <PlusIcon className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900' },
          { label: 'Approved', value: stats.approved, color: 'text-emerald-600' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
          {
            label: 'Missing Image',
            value: stats.noImage,
            color: stats.noImage > 0 ? 'text-rose-600' : 'text-gray-400',
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Missing image tip */}
      {stats.noImage > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4"
        >
          <PhotoIcon className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {stats.noImage} product{stats.noImage > 1 ? 's need' : ' needs'} an image
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Products with photos get <strong>3× more views</strong>. Hover any thumbnail and click to upload.
            </p>
          </div>
        </motion.div>
      )}

      {/* Product List */}
      {productList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <CubeIcon className="h-14 w-14 mx-auto text-gray-200 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No products yet</h3>
          <p className="text-sm text-gray-400 mb-6">Add your first product to start selling</p>
          <Link to="/seller/products/new" className="btn-primary">
            <PlusIcon className="h-4 w-4" />
            Add First Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {productList.map((product) => (
                  <motion.tr
                    key={product.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Product cell */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {/* Inline image uploader */}
                        <QuickImageUpload
                          product={product}
                          onUploaded={handleImageUploaded}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-xs">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {product.brand && (
                              <span className="text-xs text-indigo-500 font-medium">{product.brand}</span>
                            )}
                            {product.part_number && (
                              <span className="text-xs text-gray-400">#{product.part_number}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-3 text-sm font-bold text-indigo-600">
                      {formatPrice(product.price)}
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-3">
                      <span className={`badge ${
                        product.stock_quantity > 10 ? 'badge-green' :
                        product.stock_quantity > 0  ? 'badge-yellow' : 'badge-red'
                      }`}>
                        {product.stock_quantity} units
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3">
                      <StatusBadge status={product.approval_status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/products/${product.id}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View listing"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          disabled={deletingId === product.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          title="Delete product"
                        >
                          {deletingId === product.id ? (
                            <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
