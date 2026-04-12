import React, { useState, useEffect } from 'react';
import { products, admin } from '../../services/api';
import toast from 'react-hot-toast';
import { PencilIcon, TrashIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline';

const AdminProducts = () => {
  const [productList, setProductList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    brand: '',
    part_number: '',
    image_url: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await admin.getAllProducts();
      setProductList(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await products.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await products.update(editingProduct.id, formData);
        toast.success('Product updated successfully');
      } else {
        await products.create(formData);
        toast.success('Product created successfully');
      }
      fetchProducts();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id,
      brand: product.brand || '',
      part_number: product.part_number || '',
      image_url: product.image_url || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await products.delete(id);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock_quantity: '',
      category_id: '',
      brand: '',
      part_number: '',
      image_url: ''
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return <div className="text-center py-10">Loading products...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productList.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              productList.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img 
                        src={product.image_url || 'https://via.placeholder.com/40x40?text=Product'} 
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded mr-3"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/40x40?text=Product'; }}
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.part_number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{categories.find(c => c.id === product.category_id)?.name || 'N/A'}</td>
                  <td className="px-6 py-4">{formatPrice(product.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      product.stock_quantity > 10 ? 'bg-green-100 text-green-800' :
                      product.stock_quantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock_quantity} units
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                      Approved
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                   </td>
                 </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Category *</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Part Number</label>
                  <input
                    type="text"
                    name="part_number"
                    value={formData.part_number}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
