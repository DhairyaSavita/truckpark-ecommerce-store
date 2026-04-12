import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { products as productsAPI, sellerAPI, uploadAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  CloudArrowUpIcon,
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

/* ─── Indian truck brands ─── */
const BRANDS = [
  'Tata Motors', 'Ashok Leyland', 'Mahindra', 'BharatBenz',
  'Eicher', 'Force Motors', 'SML Isuzu', 'MAN Trucks',
  'Volvo Trucks', 'Scania', 'Cummins', 'Bosch', 'Bendix', 'Eaton',
];

const INITIAL_FORM = {
  name: '',
  description: '',
  price: '',
  stock_quantity: '',
  category_id: '',
  brand: '',
  part_number: '',
  image_url: '',
};

/* ─── Image Uploader Component ─── */
const ImageUploader = ({ value, onChange }) => {
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'url'
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState(value || '');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  // Sync preview when parent value changes
  useEffect(() => {
    if (value) setPreview(value);
  }, [value]);

  const handleFile = useCallback(async (file) => {
    if (!file) return;

    // Validate type & size
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG, WebP or GIF images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5 MB');
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    // Upload
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress increments while uploading
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 85));
      }, 200);

      const res = await uploadAPI.uploadProductImage(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      onChange(res.data.imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      setPreview('');
      onChange('');
      toast.error(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1500);
    }
  }, [onChange]);

  // Drag & Drop handlers
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);

  const removeImage = () => {
    setPreview('');
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreview(url);
    onChange(url);
  };

  return (
    <div className="space-y-3">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setUploadMode('file')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            uploadMode === 'file'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CloudArrowUpIcon className="h-4 w-4" />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            uploadMode === 'url'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <LinkIcon className="h-4 w-4" />
          Paste URL
        </button>
      </div>

      {/* File Upload Area */}
      <AnimatePresence mode="wait">
        {uploadMode === 'file' && (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {preview ? (
              /* Preview */
              <div className="relative group rounded-2xl overflow-hidden border-2 border-indigo-200 shadow-sm">
                <img
                  src={preview}
                  alt="Product preview"
                  className="w-full h-56 object-cover"
                  onError={() => setPreview('')}
                />
                {/* Upload progress overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
                    <div className="w-48 bg-white/20 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-white text-sm font-medium">Uploading… {uploadProgress}%</p>
                  </div>
                )}
                {/* Success checkmark */}
                {!uploading && uploadProgress === 100 && (
                  <div className="absolute top-3 right-3">
                    <CheckCircleIcon className="h-8 w-8 text-emerald-400 drop-shadow-lg" />
                  </div>
                )}
                {/* Remove button */}
                {!uploading && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
                {/* Change button */}
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Change Image
                  </button>
                )}
              </div>
            ) : (
              /* Drop Zone */
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => inputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl h-52 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? 'border-indigo-500 bg-indigo-50 scale-[1.01]'
                    : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/50'
                }`}
              >
                <div className={`p-4 rounded-2xl mb-3 transition-colors ${dragOver ? 'bg-indigo-100' : 'bg-white shadow-sm'}`}>
                  <PhotoIcon className={`h-10 w-10 ${dragOver ? 'text-indigo-500' : 'text-gray-400'}`} />
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {dragOver ? 'Drop image here' : 'Click to upload or drag & drop'}
                </p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP or GIF · Max 5 MB</p>

                {/* Animated pulse ring on drag */}
                {dragOver && (
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-indigo-400 ring-offset-2 animate-pulse pointer-events-none" />
                )}
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </motion.div>
        )}

        {/* URL Mode */}
        {uploadMode === 'url' && (
          <motion.div
            key="url"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <input
              type="url"
              value={value}
              onChange={handleUrlChange}
              placeholder="https://example.com/your-product-image.jpg"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {preview && (
              <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-200 h-44 group">
                <img
                  src={preview}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                  onError={() => {
                    setPreview('');
                    toast.error('Could not load image from that URL');
                  }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tip */}
      <p className="flex items-start gap-1.5 text-xs text-gray-400">
        <InformationCircleIcon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        Use a clear, well-lit photo of the actual part. Good images significantly increase sales.
      </p>
    </div>
  );
};

/* ─── Main Add Product Page ─── */
const AddProductSimple = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);

  useEffect(() => {
    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }
    if (user.role !== 'seller' && user.role !== 'admin') {
      toast.error('You need to be a seller to add products');
      navigate('/become-seller');
      return;
    }
    loadCategories();
  }, [user, navigate]);

  const loadCategories = async () => {
    try {
      const res = await productsAPI.getCategories();
      setCategories(res.data || []);
    } catch {
      toast.error('Failed to load categories');
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (url) =>
    setFormData((prev) => ({ ...prev, image_url: url }));

  const validate = () => {
    if (!formData.name.trim()) return 'Product name is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) return 'Enter a valid price';
    if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0) return 'Enter valid stock quantity';
    if (!formData.category_id) return 'Please select a category';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }

    setLoading(true);
    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        category_id: parseInt(formData.category_id),
        brand: formData.brand.trim() || null,
        part_number: formData.part_number.trim() || null,
        image_url: formData.image_url || null,
      };

      await sellerAPI.addProduct(productData);
      toast.success('Product added! Awaiting admin approval.');
      navigate('/seller/products');
    } catch (error) {
      const status = error.response?.status;
      if (status === 403) toast.error("You don't have permission. Contact admin.");
      else if (status === 404) toast.error('API endpoint not found. Is the backend running?');
      else toast.error(error.response?.data?.error || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="container-custom max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/seller/products')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Products
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-500 mt-1">Fill in the details — your listing will be reviewed within 24 hours.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* ── Product Image ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Product Image</h2>
            <p className="text-xs text-gray-400 mb-4">Upload a photo or paste an image URL</p>
            <ImageUploader value={formData.image_url} onChange={handleImageChange} />
          </div>

          {/* ── Basic Info ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-base font-bold text-gray-900">Basic Information</h2>

            <div>
              <label className="input-label">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g. Tata 407 Front Brake Drum — OEM Part"
              />
            </div>

            <div>
              <label className="input-label">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="input-field resize-none"
                placeholder="Describe the part, its compatibility, condition, and any important specs..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Price (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₹</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="1"
                    step="0.01"
                    className="input-field pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="input-label">Stock Quantity *</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="input-field"
                  placeholder="e.g. 50"
                />
              </div>
            </div>
          </div>

          {/* ── Classification ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-base font-bold text-gray-900">Classification</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Category *</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Brand</label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select a brand</option>
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="input-label">Part Number / SKU</label>
              <input
                type="text"
                name="part_number"
                value={formData.part_number}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. TAT-407-BD-F-OEM"
              />
              <p className="text-xs text-gray-400 mt-1">OEM part numbers help buyers find your listing through search.</p>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary min-w-[140px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding…
                </span>
              ) : (
                'Submit Product'
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default AddProductSimple;
