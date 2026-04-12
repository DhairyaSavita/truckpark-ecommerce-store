import React, { useState, useEffect } from 'react';
import { refurbisherAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowPathIcon, 
  PlusIcon, 
  CurrencyRupeeIcon, 
  ShoppingBagIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const RefurbisherDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    condition: 'refurbished',
    refurbishment_details: '',
    original_price: '',
    selling_price: '',
    stock_quantity: 1,
    warranty_months: 0,
    certification: '',
    images: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, auctionsRes] = await Promise.all([
        refurbisherAPI.getMyProducts(),
        refurbisherAPI.getMyAuctions()
      ]);
      setProducts(productsRes.data);
      setAuctions(auctionsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await refurbisherAPI.updateProduct(editingProduct.id, formData);
        toast.success('Product updated successfully');
      } else {
        await refurbisherAPI.addProduct(formData);
        toast.success('Product added successfully');
      }
      setShowProductModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      condition: product.condition,
      refurbishment_details: product.refurbishment_details || '',
      original_price: product.original_price,
      selling_price: product.selling_price,
      stock_quantity: product.stock_quantity,
      warranty_months: product.warranty_months,
      certification: product.certification || '',
      images: product.images || []
    });
    setShowProductModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await refurbisherAPI.deleteProduct(id);
        toast.success('Product deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      condition: 'refurbished',
      refurbishment_details: '',
      original_price: '',
      selling_price: '',
      stock_quantity: 1,
      warranty_months: 0,
      certification: '',
      images: []
    });
  };

  const conditions = ['Like New', 'Excellent', 'Good', 'Fair', 'For Parts'];

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Refurbisher Dashboard</h1>
            <p className="text-gray-600">Manage your refurbished products and auctions</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user?.refurbisher_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {user?.refurbisher_verified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Products</p>
                <p className="text-2xl font-bold text-green-600">{products.length}</p>
              </div>
              <ArrowPathIcon className="h-10 w-10 text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Auctions</p>
                <p className="text-2xl font-bold text-blue-600">{auctions.filter(a => a.status === 'active').length}</p>
              </div>
              <ChartBarIcon className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Sales</p>
                <p className="text-2xl font-bold text-purple-600">{user?.refurbisher_total_sales || 0}</p>
              </div>
              <CurrencyRupeeIcon className="h-10 w-10 text-purple-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 font-semibold ${activeTab === 'products' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
          >
            My Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('auctions')}
            className={`px-6 py-2 font-semibold ${activeTab === 'auctions' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
          >
            My Auctions ({auctions.length})
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  resetForm();
                  setShowProductModal(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Refurbished Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <ArrowPathIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-500 mb-4">Start adding your refurbished products</p>
                <button
                  onClick={() => setShowProductModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Add Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=Refurbished+Part'}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
                        {product.condition}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg">{product.title}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <div>
                          {product.original_price && (
                            <p className="text-sm text-gray-400 line-through">₹{product.original_price}</p>
                          )}
                          <p className="text-xl font-bold text-green-600">₹{product.selling_price}</p>
                        </div>
                        <span className="text-xs text-gray-500">Stock: {product.stock_quantity}</span>
                      </div>
                      <div className="flex justify-between mt-3 pt-3 border-t">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Auctions Tab */}
        {activeTab === 'auctions' && (
          <div>
            {auctions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <ChartBarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions yet</h3>
                <p className="text-gray-500">Create auctions for your refurbished products</p>
              </div>
            ) : (
              <div className="space-y-4">
                {auctions.map(auction => (
                  <div key={auction.id} className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{auction.title}</h3>
                        <p className="text-sm text-gray-500">Product: {auction.Product?.title}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span>Starting: ₹{auction.starting_price}</span>
                          <span>Current: ₹{auction.current_price}</span>
                          <span>Bids: {auction.total_bids}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {auction.status === 'scheduled' && `Starts: ${new Date(auction.start_time).toLocaleString()}`}
                          {auction.status === 'active' && `Ends: ${new Date(auction.end_time).toLocaleString()}`}
                          {auction.status === 'ended' && 'Auction Ended'}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                        auction.status === 'active' ? 'bg-green-100 text-green-800' :
                        auction.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {auction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {editingProduct ? 'Edit Refurbished Product' : 'Add Refurbished Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Condition *</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Warranty (months)</label>
                  <input
                    type="number"
                    value={formData.warranty_months}
                    onChange={(e) => setFormData({ ...formData, warranty_months: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Certification</label>
                  <input
                    type="text"
                    value={formData.certification}
                    onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., ISO Certified"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.images[0] || ''}
                    onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-1">Refurbishment Details</label>
                  <textarea
                    value={formData.refurbishment_details}
                    onChange={(e) => setFormData({ ...formData, refurbishment_details: e.target.value })}
                    rows="2"
                    className="w-full border rounded px-3 py-2"
                    placeholder="Describe what refurbishment was done..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefurbisherDashboard;
